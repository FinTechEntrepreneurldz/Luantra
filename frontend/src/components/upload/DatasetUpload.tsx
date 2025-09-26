'use client';

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, Cloud } from 'lucide-react';
import uploadService from '../../services/uploadService';

interface DatasetUploadProps {
  onUploadSuccess?: (response: any) => void;
}

export const DatasetUpload: React.FC<DatasetUploadProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('idle');
      setUploadMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setUploadMessage('Uploading to Google Cloud Storage...');

    try {
      const response = await uploadService.uploadDataset(
        selectedFile,
        'Dataset uploaded from Luantra platform',
        'luantra,vertex-ai,dataset'
      );

      setUploadStatus('success');
      setUploadMessage(`✅ Successfully uploaded to ${response.file.bucket}!`);
      
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }

      setTimeout(() => {
        setSelectedFile(null);
        setUploadStatus('idle');
        setUploadMessage('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);

    } catch (error) {
      setUploadStatus('error');
      setUploadMessage(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
      <div className="flex items-center mb-4">
        <Cloud className="w-6 h-6 text-blue-400 mr-2" />
        <h3 className="text-xl font-semibold text-white">Upload to Google Cloud</h3>
      </div>

      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".csv,.json,.txt,.xlsx,.xls"
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="block w-full p-4 border-2 border-dashed border-purple-500/50 rounded-lg cursor-pointer hover:border-purple-400 transition-colors text-center"
        >
          <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-white">Click to select dataset file</p>
          <p className="text-purple-300 text-sm mt-1">Supports CSV, JSON, TXT, Excel files</p>
        </label>
      </div>

      {selectedFile && (
        <div className="mb-4 p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg">
          <p className="text-white font-medium">{selectedFile.name}</p>
          <p className="text-purple-300 text-sm">
            {selectedFile.size} bytes • {selectedFile.type || 'Unknown type'}
          </p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
          !selectedFile || isUploading
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/25'
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            <span>Upload to Google Cloud</span>
          </>
        )}
      </button>

      {uploadMessage && (
        <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${
          uploadStatus === 'success' 
            ? 'bg-green-500/20 border border-green-500/30 text-green-300'
            : uploadStatus === 'error'
            ? 'bg-red-500/20 border border-red-500/30 text-red-300'
            : 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
        }`}>
          {uploadStatus === 'success' && <CheckCircle className="w-5 h-5" />}
          {uploadStatus === 'error' && <AlertCircle className="w-5 h-5" />}
          {uploadStatus === 'idle' && <Loader2 className="w-5 h-5 animate-spin" />}
          <span className="text-sm">{uploadMessage}</span>
        </div>
      )}
    </div>
  );
};

export default DatasetUpload;
