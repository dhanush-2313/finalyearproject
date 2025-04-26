import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

// Configure axios with base URL and default headers
const api = axios.create({
  baseURL: `${API_URL}/mfa`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  }
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Generate MFA secret and QR code
 * @returns {Promise<Object>} Response containing the MFA secret and QR code
 */
export const setupMFA = async () => {
  try {
    const response = await api.post('/generate');
    return response.data;
  } catch (error) {
    console.error('Error setting up MFA:', error);
    throw error;
  }
};

/**
 * Enable MFA for a user
 * @param {string} token - The OTP token from authenticator app
 * @returns {Promise<Object>} Response indicating success and backup codes
 */
export const enableMFA = async (token) => {
  try {
    const response = await api.post('/enable', { token });
    return response.data;
  } catch (error) {
    console.error('Error enabling MFA:', error);
    throw error;
  }
};

/**
 * Verify MFA token during login
 * @param {string} userId - The user ID
 * @param {string} token - The OTP token from authenticator app
 * @returns {Promise<Object>} Response with authentication token if successful
 */
export const verifyMFA = async (userId, token) => {
  try {
    const response = await api.post('/verify', { userId, token });
    
    // If verification is successful, store the token
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return { success: true, ...response.data };
  } catch (error) {
    console.error('Error verifying MFA:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Verification failed'
    };
  }
};

/**
 * Disable MFA for a user
 * @param {string} token - The OTP token from authenticator app
 * @returns {Promise<Object>} Response indicating success
 */
export const disableMFA = async (token) => {
  try {
    const response = await api.post('/disable', { token });
    return response.data;
  } catch (error) {
    console.error('Error disabling MFA:', error);
    throw error;
  }
};

/**
 * Regenerate backup codes
 * @param {string} token - The OTP token from authenticator app
 * @returns {Promise<Object>} Response with new backup codes
 */
export const regenerateBackupCodes = async (token) => {
  try {
    const response = await api.post('/backup-codes', { token });
    return response.data;
  } catch (error) {
    console.error('Error regenerating backup codes:', error);
    throw error;
  }
};