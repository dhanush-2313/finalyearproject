const express = require("express");
const router = express.Router();
const mfaController = require("../controllers/mfaController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Generate MFA secret and QR code
router.post("/generate", mfaController.generateMFASecret);

// Verify and enable MFA
router.post("/enable", mfaController.enableMFA);

// Verify MFA token during login
router.post("/verify", mfaController.verifyMFA);

// Disable MFA
router.post("/disable", mfaController.disableMFA);

// Regenerate backup codes
router.post("/backup-codes", mfaController.regenerateBackupCodes);

module.exports = router;