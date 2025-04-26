import React, { useState, useRef } from 'react';
import { uploadFileToIPFS } from '../../api/ipfs';
import { MAX_FILE_SIZE, ACCEPTED_FILE_TYPES } from '../../utils/constants';
import './FileUpload.css';

const FileUpload = ({ onUploadComplete, aidId, description = '' }) => {
  const [file, setFile] = useState(null);
  const [fileDescription, setFileDescription] = useState(description);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Check file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setError('');
  };
  
  const handleDescriptionChange = (e) => {
    setFileDescription(e.target.value);
  };
  
  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 10) + 5;
      if (currentProgress >= 95) {
        clearInterval(interval);
        setProgress(95);
      } else {
        setProgress(currentProgress);
      }
    }, 300);
    
    return () => clearInterval(interval);
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setUploading(true);
      setError('');
      
      // Start progress simulation
      const stopProgress = simulateProgress();
      
      // Upload file to IPFS
      const result = await uploadFileToIPFS(file, fileDescription, aidId);
      
      // Stop progress simulation and set to 100%
      stopProgress();
      setProgress(100);
      
      // Call the callback with the result
      if (onUploadComplete) {
        onUploadComplete(result);
      }
      
      // Reset form
      setFile(null);
      
      // Keep progress at 100% for a brief moment
      setTimeout(() => {
        setProgress(0);
        setUploading(false);
      }, 1000);
      
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to upload file');
      setUploading(false);
      setProgress(0);
    }
  };
  
  return (
    <div className="file-upload-container">
      <div className="file-upload-dropzone">
        <input
          type="file"
          id="file-upload"
          onChange={handleFileChange}
          accept={ACCEPTED_FILE_TYPES}
          disabled={uploading}
        />
        <label htmlFor="file-upload" className={`file-upload-label ${uploading ? 'disabled' : ''}`}>
          {file ? file.name : 'Select file or drag and drop here'}
        </label>
        
        {file && (
          <div className="file-info">
            <p><strong>File:</strong> {file.name}</p>
            <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
            <p><strong>Type:</strong> {file.type}</p>
          </div>
        )}
        
        <div className="file-description">
          <label htmlFor="file-description">Description (optional):</label>
          <textarea
            id="file-description"
            value={fileDescription}
            onChange={handleDescriptionChange}
            placeholder="Enter file description"
            disabled={uploading}
          />
        </div>
        
        {error && <div className="file-upload-error">{error}</div>}
        
        {progress > 0 && (
          <div className="file-upload-progress">
            <div className="progress-bar" style={{ width: `${progress}%` }}>
              {`${Math.round(progress)}%`}
            </div>
          </div>
        )}
        
        <button
          className="file-upload-button"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload to IPFS'}
        </button>
      </div>
    </div>
  );
};

export default FileUpload; 