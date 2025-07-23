// API Types for PharmD Consult

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status?: string;
}

// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  license_number?: string;
  specialty?: string;
  practice_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  license_number?: string;
  specialty?: string;
  practice_name?: string;
  is_active: boolean;
}

// Patient Types
export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone?: string;
  email?: string;
  mrn?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PatientCreate {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone?: string;
  email?: string;
  mrn?: string;
}

// Medication Types
export interface Medication {
  id: number;
  patient_id: number;
  name: string;
  generic_name?: string;
  dosage?: string;
  frequency?: string;
  source: 'photo' | 'pharmacy' | 'emr' | 'manual';
  ndc_number?: string;
  last_filled?: string;
  notes?: string;
  ocr_confidence?: number;
  created_at: string;
  updated_at: string;
}

export interface MedicationCreate {
  patient_id: number;
  name: string;
  generic_name?: string;
  dosage?: string;
  frequency?: string;
  source?: 'photo' | 'pharmacy' | 'emr' | 'manual';
  ndc_number?: string;
  last_filled?: string;
  notes?: string;
}

// Reconciliation Types
export interface Reconciliation {
  id: number;
  patient_id: number;
  provider_id: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  approved_medications?: number;
  conflicts_found?: number;
  total_medications?: number;
  patient_name?: string;
  provider_name?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  patient?: Patient;
}

export interface ReconciliationCreate {
  patient_id: number;
  notes?: string;
}

// Upload Types
export interface OCRResult {
  text: string;
  confidence: number;
  suggested_medications: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
  }>;
}

export interface ImageUploadResponse {
  filename: string;
  file_path: string;
  ocr_result?: OCRResult;
}