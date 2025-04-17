const express = require('express');
const router = express.Router();
const refugeeController = require('../controllers/refugeeController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware for authentication

// Define refugee routes
router.get('/profile', authMiddleware, refugeeController.getProfile);
router.get('/aid-received', authMiddleware, refugeeController.viewAidReceived);
router.put('/update-profile', authMiddleware, refugeeController.updateProfile);

module.exports = router;
