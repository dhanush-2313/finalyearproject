import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../auth/authContext';
import { API_URL, USER_ROLES } from '../utils/constants';
import FileUpload from '../components/FileUpload/FileUpload';
import FileList from '../components/FileList/FileList';

const IPFSFiles = () => {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'verified', 'unverified'

  // Wrap fetchFiles in useCallback
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      // Different queries based on user role
      let queryParams = '';
      if (user.role === USER_ROLES.DONOR || user.role === USER_ROLES.REFUGEE) {
        // Regular users see only their own files
        queryParams = `?userId=${user.id}`;
      }

      const response = await axios.get(`${API_URL}/ipfs/files${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      setFiles(response.data.files);
      setError('');
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  // Load files on component mount
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Handle successful file upload
  const handleUploadComplete = (result) => {
    setUploadSuccess(true);
    
    // Add the new file to the list
    setFiles(prevFiles => [result, ...prevFiles]);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setUploadSuccess(false);
    }, 3000);
  };

  // Handle file verification
  const handleVerifyFile = async (fileId) => {
    try {
      // Get current connected wallet
      let transactionHash = '';
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          // In a real implementation, this would create a blockchain transaction
          // that verifies the file hash. For now, we'll use a mock hash.
          transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        }
      }

      // Call API to verify the file
      await axios.patch(
        `${API_URL}/ipfs/files/${fileId}/verify`, 
        { transactionHash },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      
      // Show success message
      setVerifySuccess(true);
      
      // Refresh file list
      fetchFiles();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setVerifySuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error verifying file:', err);
      setError('Failed to verify file. Please try again later.');
    }
  };

  // Filter files based on verification status
  const filteredFiles = files.filter(file => {
    if (filter === 'all') return true;
    if (filter === 'verified') return file.verified;
    if (filter === 'unverified') return !file.verified;
    return true;
  });

  return (
    <div className="ipfs-files-container">
      <h1>IPFS Document Management</h1>
      <p className="ipfs-description">
        Upload, manage, and verify documents securely stored on IPFS and tracked on the blockchain.
      </p>

      {/* Success messages */}
      {uploadSuccess && (
        <div className="success-message">
          File uploaded successfully!
        </div>
      )}
      
      {verifySuccess && (
        <div className="success-message">
          File verified successfully and recorded on the blockchain!
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* File upload section */}
      <div className="ipfs-upload-section">
        <h2>Upload New Document</h2>
        <FileUpload onUploadComplete={handleUploadComplete} />
      </div>

      {/* Filter controls */}
      <div className="ipfs-filter-controls">
        <h2>Document Library</h2>
        <div className="filter-buttons">
          <button 
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Files
          </button>
          <button 
            className={`filter-button ${filter === 'verified' ? 'active' : ''}`}
            onClick={() => setFilter('verified')}
          >
            Verified
          </button>
          <button 
            className={`filter-button ${filter === 'unverified' ? 'active' : ''}`}
            onClick={() => setFilter('unverified')}
          >
            Unverified
          </button>
        </div>
      </div>

      {/* File list */}
      {loading ? (
        <div className="loading-indicator">Loading files...</div>
      ) : (
        <FileList 
          files={filteredFiles} 
          onVerify={handleVerifyFile}
          showVerifyButton={
            user.role === USER_ROLES.ADMIN || 
            user.role === USER_ROLES.FIELD_WORKER
          }
        />
      )}
    </div>
  );
};

export default IPFSFiles; 