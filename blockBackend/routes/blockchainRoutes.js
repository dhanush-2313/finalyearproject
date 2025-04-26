const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

// Public routes
router.get('/aid/:id', blockchainController.getAidRecord);
router.get('/aid', blockchainController.getAllAidRecords);
router.get('/verify/:txHash', blockchainController.verifyTransaction);

// Protected routes
router.post('/aid', authMiddleware, blockchainController.addAid);
router.put('/aid/:id', authMiddleware, blockchainController.updateAidStatus);
router.get('/events', authMiddleware, blockchainController.getRecentEvents);
router.get('/events/recent', authMiddleware, blockchainController.getRecentEvents); // New endpoint for recent events
router.get('/events/type/:type', authMiddleware, blockchainController.getEventsByType);
router.get('/latest-block', blockchainController.getLatestBlock);
router.get('/aid-records', blockchainController.getAllAidRecords);
router.get('/stats/aid', authMiddleware, roleMiddleware(['admin']), blockchainController.getAidStats); // New endpoint for aid stats

// Address resolution routes - restricted to donors and admins
router.get('/resolve/address/:address', 
          authMiddleware, 
          roleMiddleware(['admin', 'donor', 'fieldWorker']), 
          blockchainController.getUserByWalletAddress);

router.post('/resolve/addresses', 
          authMiddleware, 
          roleMiddleware(['admin', 'donor']), 
          blockchainController.resolveAddresses);

router.get('/enhanced-aid-records', 
          authMiddleware, 
          roleMiddleware(['admin', 'donor', 'fieldWorker', 'refugee']), 
          blockchainController.getEnhancedAidRecords);

module.exports = router;