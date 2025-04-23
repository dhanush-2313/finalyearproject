const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware")
const ipfsController = require('../controllers/ipfsController');

// Route for file upload to IPFS (requires authentication)
router.post('/upload', authMiddleware, ipfsController.uploadFile);

// Route to retrieve a file from IPFS by its CID
router.get('/file/:cid', ipfsController.getFile);

// Route to list files (with optional filtering)
router.get('/files', authMiddleware, ipfsController.listFiles);

// Route to verify a file (for admins and field workers only)
router.patch('/files/:fileId/verify', 
  authMiddleware, 
  ipfsController.verifyFile
);

module.exports = router; 