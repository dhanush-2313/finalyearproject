const User = require("../models/User");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const logger = require("../utils/logger");

// Generate MFA secret for user
exports.generateMFASecret = async (req, res) => {
  try {
    // Get authenticated user from request
    const userId = req.user.id;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if MFA is already enabled
    if (user.mfaEnabled) {
      return res.status(400).json({ error: "MFA is already enabled for this user" });
    }
    
    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `AidForge:${user.email}`,
      length: 20
    });
    
    // Save the secret temporarily
    user.mfaSecret = secret.base32;
    await user.save();
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    return res.status(200).json({
      success: true,
      message: "MFA secret generated successfully",
      mfaSecret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    logger.logError(`Error generating MFA secret: ${error.message}`);
    return res.status(500).json({ error: "Failed to generate MFA secret" });
  }
};

// Verify and enable MFA for user
exports.enableMFA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;
    
    if (!token) {
      return res.status(400).json({ error: "MFA token is required" });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Verify token with secret
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: token
    });
    
    if (!verified) {
      return res.status(400).json({ error: "Invalid MFA token" });
    }
    
    // Enable MFA and generate backup codes
    user.mfaEnabled = true;
    user.mfaBackupCodes = generateBackupCodes();
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: "MFA enabled successfully",
      backupCodes: user.mfaBackupCodes
    });
  } catch (error) {
    logger.logError(`Error enabling MFA: ${error.message}`);
    return res.status(500).json({ error: "Failed to enable MFA" });
  }
};

// Verify MFA token during login
exports.verifyMFA = async (req, res) => {
  try {
    const { token, userId } = req.body;
    
    if (!token || !userId) {
      return res.status(400).json({ error: "Both token and userId are required" });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if MFA is enabled
    if (!user.mfaEnabled) {
      return res.status(400).json({ error: "MFA is not enabled for this user" });
    }
    
    // Check if it's a backup code
    if (user.mfaBackupCodes.includes(token)) {
      // Remove the used backup code
      user.mfaBackupCodes = user.mfaBackupCodes.filter(code => code !== token);
      await user.save();
      return res.status(200).json({ success: true, message: "MFA verified using backup code" });
    }
    
    // Verify token with secret
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: token,
      window: 1 // Allow 30 seconds window
    });
    
    if (!verified) {
      return res.status(400).json({ error: "Invalid MFA token" });
    }
    
    return res.status(200).json({ success: true, message: "MFA verified successfully" });
  } catch (error) {
    logger.logError(`Error verifying MFA: ${error.message}`);
    return res.status(500).json({ error: "Failed to verify MFA" });
  }
};

// Disable MFA for user
exports.disableMFA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if MFA is enabled
    if (!user.mfaEnabled) {
      return res.status(400).json({ error: "MFA is not enabled for this user" });
    }
    
    // Verify token with secret
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: token,
      window: 1
    });
    
    // Also check backup codes
    const isBackupCode = user.mfaBackupCodes.includes(token);
    
    if (!verified && !isBackupCode) {
      return res.status(400).json({ error: "Invalid MFA token" });
    }
    
    // Disable MFA
    user.mfaEnabled = false;
    user.mfaSecret = null;
    user.mfaBackupCodes = [];
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: "MFA disabled successfully"
    });
  } catch (error) {
    logger.logError(`Error disabling MFA: ${error.message}`);
    return res.status(500).json({ error: "Failed to disable MFA" });
  }
};

// Generate new backup codes
exports.regenerateBackupCodes = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if MFA is enabled
    if (!user.mfaEnabled) {
      return res.status(400).json({ error: "MFA is not enabled for this user" });
    }
    
    // Verify token with secret
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: token,
      window: 1
    });
    
    if (!verified) {
      return res.status(400).json({ error: "Invalid MFA token" });
    }
    
    // Generate new backup codes
    user.mfaBackupCodes = generateBackupCodes();
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: "Backup codes regenerated successfully",
      backupCodes: user.mfaBackupCodes
    });
  } catch (error) {
    logger.logError(`Error regenerating backup codes: ${error.message}`);
    return res.status(500).json({ error: "Failed to regenerate backup codes" });
  }
};

// Helper to generate backup codes
function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Generate a random 8-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}