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


module.exports = router;
