const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


router.use(authMiddleware, roleMiddleware('donor'));

router.get('/view-donations', donorController.viewDonations);
router.post('/make-donation', donorController.makeDonation);
router.get('/track-donation/:id', donorController.trackDonation);

module.exports = router;
