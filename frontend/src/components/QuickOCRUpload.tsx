import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Camera, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../services/api';

interface QuickOCRUploadProps {
  onMedicationExtracted?: (medications: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    generic_name?: string;
  }>) => void;
  patientId?: number;
  className?: string;
}

const QuickOCRUpload: React.FC<QuickOCRUploadProps> = ({ 
  onMedicationExtracted, 
  className = "" 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => apiClient.uploadImage(file),
    onSuccess: (result) => {
      if (result.ocr_result?.suggested_medications) {
        onMedicationExtracted?.(result.ocr_result.suggested_medications);
        setUploadComplete(true);
        setTimeout(() => setUploadComplete(false), 2000);
      }
    },
  });

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        uploadMutation.mutate(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        id="quick-ocr-upload"
        className="hidden"
        accept="image/*"
        onChange={handleFileInput}
      />
      
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : uploadMutation.error
            ? 'border-red-300 bg-red-50'
            : uploadComplete
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !uploadMutation.isPending && document.getElementById('quick-ocr-upload')?.click()}
      >
        <div className="flex flex-col items-center gap-2">
          {uploadMutation.isPending ? (
            <>
              <Loader className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-600">Processing...</span>
            </>
          ) : uploadComplete ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-sm text-green-600">Medications extracted!</span>
            </>
          ) : uploadMutation.error ? (
            <>
              <AlertCircle className="w-6 h-6 text-red-600" />
              <span className="text-sm text-red-600">Upload failed</span>
            </>
          ) : (
            <>
              <Camera className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-600">
                Drop medication photo or click to upload
              </span>
              <span className="text-xs text-gray-400">
                Auto-extract medication info with OCR
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickOCRUpload;