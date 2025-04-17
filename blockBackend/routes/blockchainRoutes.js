const express = require('express');
const router = express.Router();
const blockchainGateway = require('../blockchain/gateway');

// Add aid record
router.post('/aid', async (req, res) => {
    try {
        const { recipient, aidType, amount } = req.body;
        const result = await blockchainGateway.addAidRecord(recipient, aidType, amount);
        res.json({ success: true, transactionHash: result.transactionHash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Track donations
router.get('/donations/:address', async (req, res) => {
    try {
        const donorDetails = await blockchainGateway.trackDonation(req.params.address);
        res.json(donorDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;