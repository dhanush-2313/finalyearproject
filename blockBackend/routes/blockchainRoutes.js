const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const authMiddleware = require("../middleware/authMiddleware")


// Public routes
router.get('/aid/:id', blockchainController.getAidRecord);
router.get('/aid', blockchainController.getAllAidRecords);
router.get('/verify/:txHash', blockchainController.verifyTransaction);

// Protected routes
router.post('/aid', authMiddleware, blockchainController.addAid);
router.put('/aid/:id', authMiddleware, blockchainController.updateAidStatus);
router.get('/events', authMiddleware, blockchainController.getRecentEvents);
router.get('/events/type/:type', authMiddleware, blockchainController.getEventsByType);
router.get('/latest-block', blockchainController.getLatestBlock);

module.exports = router;