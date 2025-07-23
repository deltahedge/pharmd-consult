from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Provider(Base):
    """Healthcare provider/pharmacist model"""
    __tablename__ = "providers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    license_number = Column(String(50), nullable=True)
    specialty = Column(String(100), nullable=True)
    practice_name = Column(String(200), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    reconciliations = relationship("Reconciliation", back_populates="provider")

class Patient(Base):
    """Patient model"""
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    mrn = Column(String(50), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    medications = relationship("Medication", back_populates="patient")
    reconciliations = relationship("Reconciliation", back_populates="patient")

class Medication(Base):
    """Medication model"""
    __tablename__ = "medications"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    name = Column(String(200), nullable=False)
    generic_name = Column(String(200), nullable=True)
    dosage = Column(String(100), nullable=True)
    frequency = Column(String(100), nullable=True)
    source = Column(String(50), nullable=False)  # 'photo', 'pharmacy', 'emr', 'manual'
    ndc_number = Column(String(20), nullable=True)
    last_filled = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    image_path = Column(String(500), nullable=True)
    ocr_confidence = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="medications")

class Reconciliation(Base):
    """Medication reconciliation session"""
    __tablename__ = "reconciliations"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    status = Column(String(20), default='in_progress')
    total_medications = Column(Integer, default=0)
    approved_medications = Column(Integer, default=0)
    conflicts_found = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    patient = relationship("Patient", back_populates="reconciliations")
    provider = relationship("Provider", back_populates="reconciliations")
