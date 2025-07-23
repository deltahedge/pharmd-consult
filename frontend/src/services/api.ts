import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Patient,
  PatientCreate,
  Medication,
  MedicationCreate,
  Reconciliation,
  ReconciliationCreate,
  ImageUploadResponse,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

// Debug logging - remove after fixing
console.log('API_BASE_URL:', API_BASE_URL);
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
console.log('Full environment:', import.meta.env);

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}${API_VERSION}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication Methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response: AxiosResponse<AuthResponse> = await this.client.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // Store token in localStorage
    localStorage.setItem('access_token', response.data.access_token);
    
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<User> {
    const response: AxiosResponse<User> = await this.client.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.client.get('/auth/me');
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }

  // Patient Methods
  async getPatients(): Promise<Patient[]> {
    const response: AxiosResponse<Patient[]> = await this.client.get('/patients/');
    return response.data;
  }

  async getPatient(id: number): Promise<Patient> {
    const response: AxiosResponse<Patient> = await this.client.get(`/patients/${id}`);
    return response.data;
  }

  async createPatient(patientData: PatientCreate): Promise<Patient> {
    const response: AxiosResponse<Patient> = await this.client.post('/patients/', patientData);
    return response.data;
  }

  async updatePatient(id: number, patientData: Partial<PatientCreate>): Promise<Patient> {
    const response: AxiosResponse<Patient> = await this.client.put(`/patients/${id}`, patientData);
    return response.data;
  }

  async deletePatient(id: number): Promise<void> {
    await this.client.delete(`/patients/${id}`);
  }

  // Medication Methods
  async getMedications(patientId?: number): Promise<Medication[]> {
    const params = patientId ? { patient_id: patientId } : {};
    const response: AxiosResponse<Medication[]> = await this.client.get('/medications/', { params });
    return response.data;
  }

  async getMedication(id: number): Promise<Medication> {
    const response: AxiosResponse<Medication> = await this.client.get(`/medications/${id}`);
    return response.data;
  }

  async createMedication(medicationData: MedicationCreate): Promise<Medication> {
    const response: AxiosResponse<Medication> = await this.client.post('/medications/', medicationData);
    return response.data;
  }

  async updateMedication(id: number, medicationData: Partial<MedicationCreate>): Promise<Medication> {
    const response: AxiosResponse<Medication> = await this.client.put(`/medications/${id}`, medicationData);
    return response.data;
  }

  async deleteMedication(id: number): Promise<void> {
    await this.client.delete(`/medications/${id}`);
  }

  // Reconciliation Methods
  async getReconciliations(): Promise<Reconciliation[]> {
    const response: AxiosResponse<Reconciliation[]> = await this.client.get('/reconciliations/');
    return response.data;
  }

  async getReconciliation(id: number): Promise<Reconciliation> {
    const response: AxiosResponse<Reconciliation> = await this.client.get(`/reconciliations/${id}`);
    return response.data;
  }

  async createReconciliation(reconciliationData: ReconciliationCreate): Promise<Reconciliation> {
    const response: AxiosResponse<Reconciliation> = await this.client.post('/reconciliations/', reconciliationData);
    return response.data;
  }

  async updateReconciliation(id: number, reconciliationData: Partial<ReconciliationCreate & { status: string }>): Promise<Reconciliation> {
    const response: AxiosResponse<Reconciliation> = await this.client.put(`/reconciliations/${id}`, reconciliationData);
    return response.data;
  }

  async completeReconciliation(id: number): Promise<Reconciliation> {
    const response: AxiosResponse<Reconciliation> = await this.client.post(`/reconciliations/${id}/complete`);
    return response.data;
  }

  // File Upload Methods
  async uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<ImageUploadResponse> = await this.client.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();
export default apiClient;