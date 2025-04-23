import React, { useState, useEffect } from 'react';
import { getFileFromIPFS } from '../../api/ipfs';
import { IPFS_GATEWAY_URL } from '../../utils/constants';
import './FileList.css';

const FileList = ({ files, onVerify, showVerifyButton = false }) => {
  const [loading, setLoading] = useState(false);
  const [expandedFile, setExpandedFile] = useState(null);

  // Format file size to readable format
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Handle file download
  const handleDownload = async (cid, name) => {
    setLoading(true);
    try {
      const url = await getFileFromIPFS(cid);
      
      // Create a temporary link and click it
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download the file');
    } finally {
      setLoading(false);
    }
  };

  // Handle verification of a file
  const handleVerify = (fileId) => {
    if (onVerify) {
      onVerify(fileId);
    }
  };

  // Toggle file details expansion
  const toggleFileExpansion = (fileId) => {
    if (expandedFile === fileId) {
      setExpandedFile(null);
    } else {
      setExpandedFile(fileId);
    }
  };

  // If no files, show message
  if (!files || files.length === 0) {
    return <div className="file-list-empty">No files available</div>;
  }

  return (
    <div className="file-list-container">
      <div className="file-list-header">
        <div className="file-list-header-name">Name</div>
        <div className="file-list-header-uploaded">Uploaded</div>
        <div className="file-list-header-size">Size</div>
        <div className="file-list-header-actions">Actions</div>
      </div>
      
      {files.map((file) => (
        <div key={file._id || file.cid} className="file-list-item">
          <div 
            className={`file-list-item-main ${expandedFile === file._id ? 'expanded' : ''}`}
            onClick={() => toggleFileExpansion(file._id)}
          >
            <div className="file-list-item-name">
              <i className="fas fa-file"></i>
              {file.name}
              {file.verified && <span className="file-verified-badge">Verified</span>}
            </div>
            <div className="file-list-item-uploaded">
              {formatDate(file.createdAt || file.uploadDate)}
            </div>
            <div className="file-list-item-size">
              {formatFileSize(file.size)}
            </div>
            <div className="file-list-item-actions">
              <button 
                className="file-download-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(file.cid, file.name);
                }}
                disabled={loading}
              >
                {loading ? 'Downloading...' : 'Download'}
              </button>
              
              {showVerifyButton && !file.verified && (
                <button 
                  className="file-verify-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVerify(file._id);
                  }}
                >
                  Verify
                </button>
              )}
              
              <a 
                href={`${IPFS_GATEWAY_URL}${file.cid}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="file-ipfs-link"
                onClick={(e) => e.stopPropagation()}
              >
                IPFS
              </a>
            </div>
          </div>
          
          {expandedFile === file._id && (
            <div className="file-list-item-details">
              <div><strong>Description:</strong> {file.description || 'No description'}</div>
              <div><strong>Type:</strong> {file.mimetype}</div>
              <div><strong>Uploaded by:</strong> {file.uploadedBy?.name || 'Unknown'}</div>
              {file.verified && (
                <>
                  <div><strong>Verified by:</strong> {file.verifiedBy?.name || 'Unknown'}</div>
                  <div><strong>Verification date:</strong> {formatDate(file.verificationDate)}</div>
                </>
              )}
              {file.transactionHash && (
                <div>
                  <strong>Blockchain Transaction:</strong> 
                  <a 
                    href={`https://etherscan.io/tx/${file.transactionHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {file.transactionHash.substring(0, 10)}...
                  </a>
                </div>
              )}
              <div><strong>IPFS CID:</strong> {file.cid}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FileList; 