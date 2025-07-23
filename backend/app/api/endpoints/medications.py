from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.core.database import get_db
from app.models.models import Medication, Patient
from app.api.endpoints.auth import get_current_user, Provider
from pydantic import BaseModel

router = APIRouter()

class MedicationCreate(BaseModel):
    patient_id: int
    name: str
    generic_name: str | None = None
    dosage: str | None = None
    frequency: str | None = None
    source: str = "manual"  # 'photo', 'pharmacy', 'emr', 'manual'
    ndc_number: str | None = None
    last_filled: date | None = None
    notes: str | None = None

class MedicationUpdate(BaseModel):
    name: str | None = None
    generic_name: str | None = None
    dosage: str | None = None
    frequency: str | None = None
    source: str | None = None
    ndc_number: str | None = None
    last_filled: date | None = None
    notes: str | None = None
    is_active: bool | None = None

class MedicationResponse(BaseModel):
    id: int
    patient_id: int
    name: str
    generic_name: str | None
    dosage: str | None
    frequency: str | None
    source: str
    ndc_number: str | None
    last_filled: date | None
    is_active: bool
    notes: str | None
    image_path: str | None
    ocr_confidence: int | None

    class Config:
        from_attributes = True

@router.post("/", response_model=MedicationResponse)
async def create_medication(
    medication: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: Provider = Depends(get_current_user)
):
    """Create a new medication"""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == medication.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    db_medication = Medication(**medication.dict())
    db.add(db_medication)
    db.commit()
    db.refresh(db_medication)
    return db_medication

@router.get("/", response_model=List[MedicationResponse])
async def list_medications(
    patient_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Provider = Depends(get_current_user)
):
    """Get list of medications, optionally filtered by patient"""
    query = db.query(Medication)
    if patient_id:
        query = query.filter(Medication.patient_id == patient_id)
    
    medications = query.offset(skip).limit(limit).all()
    return medications

@router.get("/{medication_id}", response_model=MedicationResponse)
async def get_medication(
    medication_id: int,
    db: Session = Depends(get_db),
    current_user: Provider = Depends(get_current_user)
):
    """Get medication by ID"""
    medication = db.query(Medication).filter(Medication.id == medication_id).first()
    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    return medication

@router.put("/{medication_id}", response_model=MedicationResponse)
async def update_medication(
    medication_id: int,
    medication_update: MedicationUpdate,
    db: Session = Depends(get_db),
    current_user: Provider = Depends(get_current_user)
):
    """Update medication information"""
    medication = db.query(Medication).filter(Medication.id == medication_id).first()
    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    for field, value in medication_update.dict(exclude_unset=True).items():
        setattr(medication, field, value)
    
    db.commit()
    db.refresh(medication)
    return medication

@router.delete("/{medication_id}")
async def delete_medication(
    medication_id: int,
    db: Session = Depends(get_db),
    current_user: Provider = Depends(get_current_user)
):
    """Delete medication"""
    medication = db.query(Medication).filter(Medication.id == medication_id).first()
    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    db.delete(medication)
    db.commit()
    return {"message": "Medication deleted successfully"}
