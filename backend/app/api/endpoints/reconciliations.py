from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Reconciliation, Patient, Medication
from app.api.endpoints.auth import get_current_user, Provider
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class ReconciliationCreate(BaseModel):
    patient_id: int
    notes: str | None = None

class ReconciliationUpdate(BaseModel):
    status: str | None = None
    notes: str | None = None
    approved_medications: int | None = None
    conflicts_found: int | None = None

class ReconciliationResponse(BaseModel):
    id: int
    patient_id: int
    provider_id: int
    status: str
    total_medications: int
    approved_medications: int
    conflicts_found: int
    notes: str | None
    created_at: datetime
    completed_at: datetime | None

    class Config:
        from_attributes = True

class ReconciliationSummary(BaseModel):
    reconciliation: ReconciliationResponse
    patient_name: str
    provider_name: str
    medications: List[dict]

@router.post("/", response_model=ReconciliationResponse)
async def create_reconciliation(
    reconciliation: ReconciliationCreate,
    db: Session = Depends(get_db),
    current_user: Provider = Depends(get_current_user)
):
    """Start a new medication reconciliation"""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == reconciliation.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Count patient's active medications
    total_meds = db.query(Medication).filter(
        Medication.patient_id == reconciliation.patient_id,
        Medication.is_active == True
    ).count()
    
    db_reconciliation = Reconciliation(
        patient_id=reconciliation.patient_id,
        provider_id=current_user.id,
        total_medications=total_meds,
        notes=reconciliation.notes
    )
    
    db.add(db_reconciliation)
    db.commit()
    db.refresh(db_reconciliation)
    return db_reconciliation

@router.get("/", response_model=List[ReconciliationResponse])
async def list_reconciliations(
    status: str | None = None,
    patient_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Provider = Depends(get_current_user)
):
    """Get list of reconciliations"""
    query = db.query(Reconciliation)
    
    if status:
        query = query.filter(Reconciliation.status == status)
    if patient_id:
        query = query.filter(Reconciliation.patient_id == patient_id)
    
    reconciliations = query.offset(skip).limit(limit).all()
    return reconciliations

@router.get("/{reconciliation_id}", response_model=ReconciliationSummary)
async def get_reconciliation(
    reconciliation_id: int,
    db: Session = Depends(get_db),
    current_user: Provider = Depends(get_current_user)
):
    """Get reconciliation details with patient and medication info"""
    reconciliation = db.query(Reconciliation).filter(
        Reconciliation.id == reconciliation_id
    ).first()
    
    if not reconciliation:
        raise HTTPException(status_code=404, detail="Reconciliation not found")
    
    # Get patient and medications
    patient = reconciliation.patient
    medications = db.query(Medication).filter(
        Medication.patient_id == reconciliation.patient_id,
        Medication.is_active == True
    ).all()
    
    return {
        "reconciliation": reconciliation,
        "patient_name": f"{patient.first_name} {patient.last_name}",
        "provider_name": reconciliation.provider.name,
        "medications": [
            {
                "id": med.id,
                "name": med.name,
                "dosage": med.dosage,
                "frequency": med.frequency,
                "source": med.source
            } for med in medications
        ]
    }

@router.put("/{reconciliation_id}", response_model=ReconciliationResponse)
async def update_reconciliation(
    reconciliation_id: int,
    reconciliation_update: ReconciliationUpdate,
    db: Session = Depends(get_db),
    current_user: Provider = Depends(get_current_user)
):
    """Update reconciliation status and details"""
    reconciliation = db.query(Reconciliation).filter(
        Reconciliation.id == reconciliation_id
    ).first()
    
    if not reconciliation:
        raise HTTPException(status_code=404, detail="Reconciliation not found")
    
    for field, value in reconciliation_update.dict(exclude_unset=True).items():
        setattr(reconciliation, field, value)
    
    # If status is being set to completed, set completion time
    if reconciliation_update.status == "completed":
        reconciliation.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(reconciliation)
    return reconciliation

@router.post("/{reconciliation_id}/complete")
async def complete_reconciliation(
    reconciliation_id: int,
    db: Session = Depends(get_db),
    current_user: Provider = Depends(get_current_user)
):
    """Mark reconciliation as completed"""
    reconciliation = db.query(Reconciliation).filter(
        Reconciliation.id == reconciliation_id
    ).first()
    
    if not reconciliation:
        raise HTTPException(status_code=404, detail="Reconciliation not found")
    
    reconciliation.status = "completed"
    reconciliation.completed_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Reconciliation completed successfully"}
