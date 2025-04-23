const { uploadToIPFS, fetchFromIPFS } = require('../utils/ipfs');
const logger = require('../utils/logger');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const IPFSFile = require('../models/IPFSFile');
const monitoring = require('../utils/monitoring');

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    // Accept images, documents, and common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|csv/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image, document and common data files are allowed'));
  }
}).single('file');

// Handle file upload to IPFS
exports.uploadFile = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      logger.logError(`Upload error: ${err.message}`);
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    try {
      const filePath = req.file.path;
      const fileData = fs.readFileSync(filePath);
      
      // Create metadata object to store with file
      const metadata = {
        name: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.user.id,
        uploadDate: new Date().toISOString(),
        description: req.body.description || '',
        associatedAidId: req.body.aidId || null
      };
      
      // Upload both file and metadata to IPFS
      const fileBuffer = Buffer.from(JSON.stringify({
        content: fileData.toString('base64'),
        metadata
      }));
      
      const cid = await uploadToIPFS(fileBuffer);
      
      // Clean up temporary file
      fs.unlinkSync(filePath);
      
      // Save file metadata to database
      const ipfsFile = new IPFSFile({
        cid,
        name: metadata.name,
        description: metadata.description,
        mimetype: metadata.mimetype,
        size: metadata.size,
        uploadedBy: req.user.id,
        associatedAidId: metadata.associatedAidId
      });
      
      await ipfsFile.save();
      
      // Increment counter for successful uploads
      monitoring.metrics.ipfsOperationsTotal.inc({ operation: 'upload_success' });
      
      // Return the IPFS hash (CID)
      return res.status(200).json({ 
        success: true, 
        cid,
        metadata,
        fileId: ipfsFile._id
      });
    } catch (error) {
      logger.logError(`IPFS Upload error: ${error.message}`);
      return res.status(500).json({ error: `Failed to upload to IPFS: ${error.message}` });
    }
  });
};

// Retrieve file from IPFS
exports.getFile = async (req, res) => {
  try {
    const { cid } = req.params;
    
    if (!cid) {
      return res.status(400).json({ error: 'CID is required' });
    }
    
    // Check if metadata exists in our database
    const fileMetadata = await IPFSFile.findOne({ cid });
    
    const fileData = await fetchFromIPFS(cid);
    const { content, metadata } = JSON.parse(fileData);
    
    // For API response, return the content and metadata
    if (req.query.contentType === 'json') {
      return res.status(200).json({ 
        metadata: fileMetadata || metadata,
        content 
      });
    }
    
    // For file download, decode and send the file
    const buffer = Buffer.from(content, 'base64');
    res.setHeader('Content-Type', metadata.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${metadata.name}"`);
    
    // Increment counter for successful downloads
    monitoring.metrics.ipfsOperationsTotal.inc({ operation: 'download' });
    
    return res.send(buffer);
  } catch (error) {
    logger.logError(`IPFS Fetch error: ${error.message}`);
    return res.status(500).json({ error: `Failed to fetch from IPFS: ${error.message}` });
  }
};

// List all files for a user or associated with an aid
exports.listFiles = async (req, res) => {
  try {
    let query = {};
    
    // Filter by user if requested
    if (req.query.userId) {
      query.uploadedBy = req.query.userId;
    }
    
    // Filter by aid ID if requested
    if (req.query.aidId) {
      query.associatedAidId = req.query.aidId;
    }
    
    // Get files from database
    const files = await IPFSFile.find(query)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email')
      .populate('verifiedBy', 'name email');
    
    return res.status(200).json({ files });
  } catch (error) {
    logger.logError(`Error listing IPFS files: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// Verify a file (for admins and field workers)
exports.verifyFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Only admins and field workers can verify files
    if (!['admin', 'fieldWorker'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized to verify files' });
    }
    
    const file = await IPFSFile.findById(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Update verification status
    file.verified = true;
    file.verifiedBy = req.user.id;
    file.verificationDate = new Date();
    
    // Add transaction hash if provided
    if (req.body.transactionHash) {
      file.transactionHash = req.body.transactionHash;
    }
    
    await file.save();
    
    return res.status(200).json({ success: true, file });
  } catch (error) {
    logger.logError(`Error verifying file: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
}; 