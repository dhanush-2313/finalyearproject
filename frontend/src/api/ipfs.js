import axios from 'axios';
import { API_URL } from '../utils/constants';

export const uploadFileToIPFS = async (file, description = '', aidId = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (description) {
      formData.append('description', description);
    }
    
    if (aidId) {
      formData.append('aidId', aidId);
    }

    const response = await axios.post(`${API_URL}/ipfs/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

export const getFileFromIPFS = async (cid) => {
  try {
    const response = await axios.get(`${API_URL}/ipfs/file/${cid}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      responseType: 'blob',
    });

    const url = URL.createObjectURL(response.data);
    return url;
  } catch (error) {
    console.error('Error getting file from IPFS:', error);
    throw error;
  }
};

export const verifyFile = async (fileId, transactionHash) => {
  try {
    const response = await axios.post(
      `${API_URL}/ipfs/verify/${fileId}`,
      { transactionHash },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error verifying file:', error);
    throw error;
  }
};

// Export both named functions and default object
const ipfsAPI = {
  uploadFileToIPFS,
  getFileFromIPFS,
  verifyFile,
};

export default ipfsAPI; 