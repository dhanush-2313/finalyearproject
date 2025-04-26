import apiClient from './apiClient';

class MFAService {
  /**
   * Generate MFA secret and QR code for initial setup
   */
  static async generateSecret() {
    try {
      const response = await apiClient.get('/api/mfa/setup');
      return response.data;
    } catch (error) {
      console.error('Error generating MFA secret:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to generate MFA secret'
      };
    }
  }

  /**
   * Verify and enable MFA for user
   * @param {string} code - Verification code from authenticator app
   */
  static async enableMFA(code) {
    try {
      const response = await apiClient.post('/api/mfa/enable', { code });
      return response.data;
    } catch (error) {
      console.error('Error enabling MFA:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to enable MFA'
      };
    }
  }

  /**
   * Verify MFA code during login
   * @param {string} userId - User ID
   * @param {string} code - Verification code from authenticator app
   */
  static async verifyMFA(userId, code) {
    try {
      const response = await apiClient.post('/api/mfa/verify', { 
        userId, 
        code 
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying MFA code:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Invalid verification code'
      };
    }
  }

  /**
   * Disable MFA for user (requires current password)
   * @param {string} password - Current password for verification
   * @param {string} code - Current MFA code for verification
   */
  static async disableMFA(password, code) {
    try {
      const response = await apiClient.post('/api/mfa/disable', { 
        password,
        code
      });
      return response.data;
    } catch (error) {
      console.error('Error disabling MFA:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to disable MFA'
      };
    }
  }

  /**
   * Use backup code for login
   * @param {string} userId - User ID
   * @param {string} backupCode - Backup code
   */
  static async verifyBackupCode(userId, backupCode) {
    try {
      const response = await apiClient.post('/api/mfa/recover', {
        userId,
        backupCode
      });
      return response.data;
    } catch (error) {
      console.error('Error using backup code:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Invalid backup code'
      };
    }
  }

  /**
   * Generate new backup codes (invalidates old ones)
   */
  static async regenerateBackupCodes() {
    try {
      const response = await apiClient.post('/api/mfa/backup-codes/regenerate');
      return response.data;
    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to regenerate backup codes'
      };
    }
  }
}

export default MFAService;