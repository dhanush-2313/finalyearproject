const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


router.use(authMiddleware, roleMiddleware('admin'));


router.get('/dashboard', adminController.getDashboardStats);
router.post('/create-fieldworker', adminController.createFieldWorker);
router.delete('/delete-fieldworker/:id', (req, res, next) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    next();
  }, adminController.deleteFieldWorker);
router.get('/logs', adminController.getActivityLogs);

// New routes to support Admin dashboard
router.get('/stats/users', adminController.getUserStats);
router.get('/stats/donations', adminController.getDonationStats); // Added donation stats endpoint
router.get('/users', adminController.getUsers);
router.get('/activity-logs', adminController.getLogs);
router.get('/donations', adminController.getAllDonations);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);


module.exports = router;
