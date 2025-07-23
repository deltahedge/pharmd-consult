import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Edit, 
  Save,
  User,
  Calendar,
  Pill,
  FileText,
  Check
} from 'lucide-react';
import { apiClient } from '../services/api';
import type { Medication, MedicationCreate } from '../types/api';

interface MedicationReviewState {
  [medicationId: number]: {
    approved: boolean;
    modified: boolean;
    conflicts: string[];
    notes: string;
    updatedData?: Partial<MedicationCreate>;
  };
}

const ReconciliationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [reviewState, setReviewState] = useState<MedicationReviewState>({});
  const [editingMedication, setEditingMedication] = useState<number | null>(null);
  const [reconciliationNotes, setReconciliationNotes] = useState('');

  const reconciliationId = Number(id);

  const { data: reconciliationData, isLoading, error } = useQuery({
    queryKey: ['reconciliation', reconciliationId],
    queryFn: () => apiClient.getReconciliation(reconciliationId),
    enabled: !!reconciliationId,
  });

  const { data: medications } = useQuery({
    queryKey: ['medications', reconciliationData?.patient_id],
    queryFn: () => apiClient.getMedications(reconciliationData?.patient_id),
    enabled: !!reconciliationData?.patient_id,
  });

  const updateMedicationMutation = useMutation({
    mutationFn: ({ medicationId, data }: { medicationId: number; data: Partial<MedicationCreate> }) =>
      apiClient.updateMedication(medicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const updateReconciliationMutation = useMutation({
    mutationFn: (data: { approved_medications: number; conflicts_found: number; notes?: string }) =>
      apiClient.updateReconciliation(reconciliationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation', reconciliationId] });
      queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
    },
  });

  const completeReconciliationMutation = useMutation({
    mutationFn: () => apiClient.completeReconciliation(reconciliationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation', reconciliationId] });
      queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
      navigate('/reconciliations');
    },
  });

  React.useEffect(() => {
    if (reconciliationData) {
      setReconciliationNotes(reconciliationData.notes || '');
    }
  }, [reconciliationData]);

  const detectConflicts = (medication: Medication): string[] => {
    const conflicts: string[] = [];
    
    // Example conflict detection logic
    if (!medication.dosage || !medication.frequency) {
      conflicts.push('Missing dosage or frequency information');
    }
    
    if (medication.source === 'photo' && (!medication.ocr_confidence || medication.ocr_confidence < 80)) {
      conflicts.push('Low OCR confidence - manual verification recommended');
    }
    
    if (!medication.last_filled) {
      conflicts.push('No last filled date available');
    }
    
    // Check for duplicate medications (same name)
    const duplicates = medications?.filter(med => 
      med.id !== medication.id && 
      med.name.toLowerCase() === medication.name.toLowerCase()
    );
    
    if (duplicates && duplicates.length > 0) {
      conflicts.push('Potential duplicate medication detected');
    }
    
    return conflicts;
  };

  const handleMedicationReview = (medicationId: number, approved: boolean) => {
    const medication = medications?.find(m => m.id === medicationId);
    if (!medication) return;

    const conflicts = detectConflicts(medication);
    
    setReviewState(prev => ({
      ...prev,
      [medicationId]: {
        ...prev[medicationId],
        approved,
        conflicts,
        notes: prev[medicationId]?.notes || '',
      }
    }));
  };

  const handleSaveMedicationEdit = (medicationId: number, updatedData: Partial<MedicationCreate>) => {
    updateMedicationMutation.mutate({ medicationId, data: updatedData });
    
    setReviewState(prev => ({
      ...prev,
      [medicationId]: {
        ...prev[medicationId],
        modified: true,
        updatedData,
      }
    }));
    
    setEditingMedication(null);
  };

  const handleCompleteReconciliation = () => {
    const approvedCount = Object.values(reviewState).filter(state => state.approved).length;
    const totalConflicts = Object.values(reviewState).reduce((sum, state) => sum + state.conflicts.length, 0);
    
    // Update reconciliation statistics
    updateReconciliationMutation.mutate({
      approved_medications: approvedCount,
      conflicts_found: totalConflicts,
      notes: reconciliationNotes,
    });
    
    // Complete the reconciliation
    completeReconciliationMutation.mutate();
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex px-3 py-1 text-sm font-medium rounded-full capitalize";
    switch (status) {
      case 'completed': return `${baseClasses} bg-green-100 text-green-800`;
      case 'in_progress': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getSourceBadge = (source: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize";
    switch (source) {
      case 'photo': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'pharmacy': return `${baseClasses} bg-green-100 text-green-800`;
      case 'emr': return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'manual': return `${baseClasses} bg-gray-100 text-gray-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !reconciliationData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading reconciliation details. Please try again.</p>
      </div>
    );
  }

  const { patient_name, provider_name } = reconciliationData;
  const approvedCount = Object.values(reviewState).filter(state => state.approved).length;
  const reviewedCount = Object.keys(reviewState).length;
  const totalMedications = medications?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/reconciliations')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Reconciliation #{reconciliationData.id}
            </h1>
            <p className="text-gray-600">Review and approve patient medications</p>
          </div>
        </div>
        <span className={getStatusBadge(reconciliationData.status)}>
          {reconciliationData.status.replace('_', ' ')}
        </span>
      </div>

      {/* Patient & Reconciliation Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Patient Information
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Patient</p>
              <p className="text-gray-900">{patient_name}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Provider</p>
              <p className="text-gray-900">{provider_name}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Started</p>
              <p className="text-gray-900 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(reconciliationData.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Status</p>
              <p className="text-gray-900">{reconciliationData.status.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Medications Reviewed</span>
                <span>{reviewedCount}/{totalMedications}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all" 
                  style={{ width: `${totalMedications > 0 ? (reviewedCount / totalMedications) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Approved</span>
                <span>{approvedCount}/{totalMedications}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all" 
                  style={{ width: `${totalMedications > 0 ? (approvedCount / totalMedications) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medications Review */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Pill className="w-5 h-5" />
            Medication Review
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {medications?.map((medication) => {
            const reviewData = reviewState[medication.id];
            const conflicts = reviewData?.conflicts || detectConflicts(medication);
            const isEditing = editingMedication === medication.id;

            return (
              <div key={medication.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{medication.name}</h3>
                      <span className={getSourceBadge(medication.source)}>
                        {medication.source}
                      </span>
                      {conflicts.length > 0 && (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Dosage:</span>
                        <p>{medication.dosage || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span>
                        <p>{medication.frequency || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Generic:</span>
                        <p>{medication.generic_name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Last Filled:</span>
                        <p>{medication.last_filled ? new Date(medication.last_filled).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>

                    {conflicts.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Potential Issues
                        </h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {conflicts.map((conflict, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span>•</span>
                              <span>{conflict}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {reviewData?.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-700">{reviewData.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setEditingMedication(isEditing ? null : medication.id)}
                      className="text-gray-600 hover:text-gray-900 p-1"
                      title="Edit medication"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMedicationReview(medication.id, true)}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          reviewData?.approved
                            ? 'bg-green-100 border-green-500 text-green-700'
                            : 'border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-600'
                        }`}
                        title="Approve medication"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleMedicationReview(medication.id, false)}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          reviewData?.approved === false
                            ? 'bg-red-100 border-red-500 text-red-700'
                            : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-600'
                        }`}
                        title="Reject medication"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <MedicationEditForm
                    medication={medication}
                    onSave={(data) => handleSaveMedicationEdit(medication.id, data)}
                    onCancel={() => setEditingMedication(null)}
                    isLoading={updateMedicationMutation.isPending}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes and Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Reconciliation Notes
        </h2>
        <textarea
          value={reconciliationNotes}
          onChange={(e) => setReconciliationNotes(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Add notes about this reconciliation..."
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => navigate('/reconciliations')}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Save & Return Later
          </button>
          <button
            onClick={handleCompleteReconciliation}
            disabled={reviewedCount < totalMedications || completeReconciliationMutation.isPending}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {completeReconciliationMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Completing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Complete Reconciliation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const MedicationEditForm: React.FC<{
  medication: Medication;
  onSave: (data: Partial<MedicationCreate>) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ medication, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<Partial<MedicationCreate>>({
    name: medication.name,
    generic_name: medication.generic_name || '',
    dosage: medication.dosage || '',
    frequency: medication.frequency || '',
    ndc_number: medication.ndc_number || '',
    last_filled: medication.last_filled || '',
    notes: medication.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Edit Medication</h4>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Medication Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Generic Name
          </label>
          <input
            type="text"
            value={formData.generic_name}
            onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Dosage
          </label>
          <input
            type="text"
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Frequency
          </label>
          <input
            type="text"
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-600 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-3 h-3" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ReconciliationDetail;