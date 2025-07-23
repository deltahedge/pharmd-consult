from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from PIL import Image
import pytesseract
from app.core.database import get_db
from app.core.config import settings
from app.models.models import Medication, Patient
from app.api.endpoints.auth import get_current_user, Provider
from pydantic import BaseModel

router = APIRouter()

class OCRResult(BaseModel):
    text: str
    confidence: int
    suggested_medications: List[dict]

class ImageUploadResponse(BaseModel):
    filename: str
    file_path: str
    ocr_result: OCRResult | None = None

@router.post("/image", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    patient_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: Provider = Depends(get_current_user)
):
    """Upload and process medication image with OCR"""
    
    # Validate file type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {settings.ALLOWED_IMAGE_TYPES}"
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save uploaded file
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            if len(content) > settings.MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail="File too large")
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Process with OCR
    ocr_result = None
    try:
        ocr_result = await process_medication_image(file_path)
    except Exception as e:
        print(f"OCR processing failed: {str(e)}")
        # Continue without OCR if it fails
    
    # If patient_id provided, create medication entries
    if patient_id and ocr_result:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if patient:
            await create_medications_from_ocr(
                patient_id, ocr_result, file_path, db
            )
    
    return {
        "filename": unique_filename,
        "file_path": f"/uploads/{unique_filename}",
        "ocr_result": ocr_result
    }

async def process_medication_image(file_path: str) -> OCRResult:
    """Process image with OCR to extract medication information"""
    try:
        # Open and preprocess image
        image = Image.open(file_path)
        
        # Convert to grayscale for better OCR
        if image.mode != 'L':
            image = image.convert('L')
        
        # Extract text using Tesseract
        extracted_text = pytesseract.image_to_string(image)
        
        # Get confidence score
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
        avg_confidence = sum(confidences) // len(confidences) if confidences else 0
        
        # Parse medications from text
        suggested_medications = parse_medications_from_text(extracted_text)
        
        return OCRResult(
            text=extracted_text.strip(),
            confidence=avg_confidence,
            suggested_medications=suggested_medications
        )
        
    except Exception as e:
        raise Exception(f"OCR processing failed: {str(e)}")

def parse_medications_from_text(text: str) -> List[dict]:
    """Parse medication information from OCR text"""
    medications = []
    lines = text.split('\n')
    
    # Simple parsing logic - look for medication patterns
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Look for patterns like "Drug Name 100mg"
        words = line.split()
        if len(words) >= 2:
            # Check if line contains dosage indicators
            dosage_indicators = ['mg', 'ml', 'tablet', 'capsule', 'once', 'twice', 'daily']
            if any(indicator in line.lower() for indicator in dosage_indicators):
                medications.append({
                    "name": words[0],
                    "dosage": extract_dosage(line),
                    "frequency": extract_frequency(line),
                    "raw_text": line
                })
    
    return medications

def extract_dosage(text: str) -> str:
    """Extract dosage from text"""
    import re
    dosage_pattern = r'(\d+\.?\d*\s*(mg|ml|g|mcg))'
    match = re.search(dosage_pattern, text.lower())
    return match.group(1) if match else ""

def extract_frequency(text: str) -> str:
    """Extract frequency from text"""
    text_lower = text.lower()
    if 'once' in text_lower and 'daily' in text_lower:
        return "Once daily"
    elif 'twice' in text_lower and 'daily' in text_lower:
        return "Twice daily"
    elif 'three times' in text_lower or 'tid' in text_lower:
        return "Three times daily"
    elif 'four times' in text_lower or 'qid' in text_lower:
        return "Four times daily"
    return ""

async def create_medications_from_ocr(
    patient_id: int, 
    ocr_result: OCRResult, 
    image_path: str, 
    db: Session
):
    """Create medication records from OCR results"""
    for med_data in ocr_result.suggested_medications:
        medication = Medication(
            patient_id=patient_id,
            name=med_data["name"],
            dosage=med_data["dosage"],
            frequency=med_data["frequency"],
            source="photo",
            image_path=image_path,
            ocr_confidence=ocr_result.confidence,
            notes=f"Auto-extracted from image. Raw text: {med_data['raw_text']}"
        )
        db.add(medication)
    
    db.commit()

@router.get("/images/{filename}")
async def get_uploaded_image(filename: str):
    """Serve uploaded images"""
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(file_path)
