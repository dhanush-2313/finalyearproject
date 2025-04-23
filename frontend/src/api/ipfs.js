import axios from 'axios';
import { API_URL } from '../utils/constants';

const ipfsApi = axios.create({
  baseURL: `${API_URL}/ipfs`,
});

// Add auth token to requests
ipfsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Upload a file to IPFS
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
    
    const response = await ipfsApi.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
};

// Get a file from IPFS by CID
export const getFileFromIPFS = async (cid, asJson = false) => {
  try {
    const url = `/file/${cid}${asJson ? '?contentType=json' : ''}`;
    
    if (asJson) {
      const response = await ipfsApi.get(url);
      return response.data;
    } else {
      // For file download, create a download link
      const response = await ipfsApi.get(url, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      return url;
    }
  } catch (error) {
    console.error('Error getting file from IPFS:', error);
    throw error;
  }
};

export default {
  uploadFileToIPFS,
  getFileFromIPFS,
}; 