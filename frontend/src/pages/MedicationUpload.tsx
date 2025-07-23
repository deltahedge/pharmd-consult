import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle,
  Edit,
  Save,
  X,
  User,
  Pill,
  Eye,
  Download,
  Loader,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../services/api';
import type { Patient, MedicationCreate, ImageUploadResponse } from '../types/api';

interface ProcessedMedication extends MedicationCreate {
  id?: number;
  confidence?: number;
  raw_text?: string;
  approved?: boolean;
  edited?: boolean;
}

interface UploadState {
  file: File | null;
  imageUrl: string | null;
  uploading: boolean;
  processing: boolean;
  processed: boolean;
  error: string | null;
  ocrResult: ImageUploadResponse | null;
  medications: ProcessedMedication[];
}

const MedicationUpload: React.FC = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    imageUrl: null,
    uploading: false,
    processing: false,
    processed: false,
    error: null,
    ocrResult: null,
    medications: []
  });

  const queryClient = useQueryClient();

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => apiClient.getPatients(),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, patientId }: { file: File; patientId?: number }) => 
      apiClient.uploadImage(file),
    onMutate: () => {
      setUploadState(prev => ({ ...prev, uploading: true, error: null }));
    },
    onSuccess: (result) => {
      setUploadState(prev => ({ 
        ...prev, 
        uploading: false,
        processing: false,
        processed: true,
        ocrResult: result,
        medications: result.ocr_result ? transformOCRToMedications(result.ocr_result, selectedPatientId) : []
      }));
    },
    onError: (error: any) => {
      setUploadState(prev => ({ 
        ...prev, 
        uploading: false,
        processing: false,
        error: error.message || 'Upload failed' 
      }));
    },
  });

  const saveMedicationsMutation = useMutation({
    mutationFn: (medications: MedicationCreate[]) => 
      Promise.all(medications.map(med => apiClient.createMedication(med))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      // Reset upload state
      setUploadState({
        file: null,
        imageUrl: null,
        uploading: false,
        processing: false,
        processed: false,
        error: null,
        ocrResult: null,
        medications: []
      });
    },
  });

  const transformOCRToMedications = (ocrResult: any, patientId: number | null): ProcessedMedication[] => {
    if (!ocrResult.suggested_medications || !patientId) return [];
    
    return ocrResult.suggested_medications.map((med: any, index: number) => ({
      patient_id: patientId,
      name: med.name || '',
      generic_name: med.generic_name || '',
      dosage: med.dosage || '',
      frequency: med.frequency || '',
      source: 'photo' as const,
      notes: `OCR extracted from image. Raw text: ${med.raw_text || ''}`,
      confidence: ocrResult.confidence,
      raw_text: med.raw_text || '',
      approved: false,
      edited: false,
    }));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setUploadState(prev => ({
      ...prev,
      file,
      imageUrl,
      error: null,
      processed: false,
      medications: []
    }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleProcessImage = () => {
    if (!uploadState.file || !selectedPatientId) return;
    
    setUploadState(prev => ({ ...prev, processing: true }));
    uploadMutation.mutate({ 
      file: uploadState.file, 
      patientId: selectedPatientId 
    });
  };

  const handleMedicationEdit = (index: number, updates: Partial<ProcessedMedication>) => {
    setUploadState(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, ...updates, edited: true } : med
      )
    }));
  };

  const handleMedicationApprove = (index: number, approved: boolean) => {
    setUploadState(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, approved } : med
      )
    }));
  };

  const handleSaveApprovedMedications = () => {
    const approvedMedications = uploadState.medications
      .filter(med => med.approved)
      .map(({ confidence, raw_text, approved, edited, ...med }) => med);
    
    if (approvedMedications.length === 0) return;
    
    saveMedicationsMutation.mutate(approvedMedications);
  };

  const approvedCount = uploadState.medications.filter(med => med.approved).length;
  const selectedPatient = patients?.find(p => p.id === selectedPatientId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medication OCR Upload</h1>
          <p className="text-gray-600">Upload medication photos to extract information automatically</p>
        </div>
      </div>

      {/* Patient Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Select Patient
        </h2>
        <div className="max-w-md">
          <select
            value={selectedPatientId || ''}
            onChange={(e) => setSelectedPatientId(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a patient</option>
            {patients?.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.first_name} {patient.last_name} 
                {patient.mrn ? ` (${patient.mrn})` : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedPatient && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Patient</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Name:</strong> {selectedPatient.first_name} {selectedPatient.last_name}</p>
              <p><strong>DOB:</strong> {new Date(selectedPatient.date_of_birth).toLocaleDateString()}</p>
              {selectedPatient.mrn && <p><strong>MRN:</strong> {selectedPatient.mrn}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Upload Interface */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Upload Medication Photo
        </h2>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          
          {uploadState.imageUrl ? (
            <div className="space-y-4">
              <img
                src={uploadState.imageUrl}
                alt="Medication upload"
                className="mx-auto max-w-full max-h-64 rounded-lg shadow"
              />
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadState(prev => ({ ...prev, file: null, imageUrl: null }));
                  }}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProcessImage();
                  }}
                  disabled={!selectedPatientId || uploadState.uploading || uploadState.processing}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {uploadState.processing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Process Image
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {isDragActive ? 'Drop the image here' : 'Upload medication photo'}
                </p>
                <p className="text-gray-500">
                  Drag & drop an image here, or click to select
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports JPEG, PNG, GIF up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>

        {uploadState.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="text-red-800 font-medium">Upload Error</h4>
                <p className="text-red-700 text-sm">{uploadState.error}</p>
              </div>
            </div>
          </div>
        )}

        {!selectedPatientId && uploadState.file && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-yellow-800 font-medium">Patient Required</h4>
                <p className="text-yellow-700 text-sm">Please select a patient before processing the image.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* OCR Results */}
      {uploadState.processed && uploadState.medications.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Pill className="w-5 h-5" />
              Extracted Medications ({uploadState.medications.length})
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Confidence: {uploadState.ocrResult?.ocr_result?.confidence || 0}%
              </span>
              <button
                onClick={handleSaveApprovedMedications}
                disabled={approvedCount === 0 || saveMedicationsMutation.isPending}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saveMedicationsMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Approved ({approvedCount})
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {uploadState.medications.map((medication, index) => (
              <MedicationReviewCard
                key={index}
                medication={medication}
                onEdit={(updates) => handleMedicationEdit(index, updates)}
                onApprove={(approved) => handleMedicationApprove(index, approved)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Raw OCR Text */}
      {uploadState.processed && uploadState.ocrResult?.ocr_result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Raw OCR Text
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {uploadState.ocrResult.ocr_result.text || 'No text detected'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

const MedicationReviewCard: React.FC<{
  medication: ProcessedMedication;
  onEdit: (updates: Partial<ProcessedMedication>) => void;
  onApprove: (approved: boolean) => void;
}> = ({ medication, onEdit, onApprove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(medication);

  const handleSaveEdit = () => {
    onEdit(editData);
    setIsEditing(false);
  };

  const confidenceColor = (confidence: number | undefined) => {
    if (!confidence) return 'text-gray-500';
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`border rounded-lg p-4 transition-colors ${
      medication.approved ? 'border-green-200 bg-green-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Generic Name
                  </label>
                  <input
                    type="text"
                    value={editData.generic_name}
                    onChange={(e) => setEditData({ ...editData, generic_name: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={editData.dosage}
                    onChange={(e) => setEditData({ ...editData, dosage: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <input
                    type="text"
                    value={editData.frequency}
                    onChange={(e) => setEditData({ ...editData, frequency: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(medication);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-medium text-gray-900">{medication.name || 'Unnamed Medication'}</h3>
                {medication.confidence && (
                  <span className={`text-xs font-medium ${confidenceColor(medication.confidence)}`}>
                    {medication.confidence}% confidence
                  </span>
                )}
                {medication.edited && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Edited
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                <div>
                  <span className="font-medium">Generic:</span>
                  <p>{medication.generic_name || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium">Dosage:</span>
                  <p>{medication.dosage || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium">Frequency:</span>
                  <p>{medication.frequency || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium">Source:</span>
                  <p className="capitalize">{medication.source}</p>
                </div>
              </div>

              {medication.raw_text && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  <strong>Raw OCR text:</strong> {medication.raw_text}
                </div>
              )}
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-600 hover:text-gray-900 p-1"
              title="Edit medication"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(true)}
                className={`p-2 rounded-lg border-2 transition-colors ${
                  medication.approved
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-600'
                }`}
                title="Approve medication"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => onApprove(false)}
                className={`p-2 rounded-lg border-2 transition-colors ${
                  medication.approved === false
                    ? 'bg-red-100 border-red-500 text-red-700'
                    : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-600'
                }`}
                title="Reject medication"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationUpload;