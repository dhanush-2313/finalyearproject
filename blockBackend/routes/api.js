const express = require("express");
const router = express.Router();
const { getAidRecord, addAidRecord, updateAidStatus } = require("../utils/BlockchainGateway");
require("dotenv").config();

// Fetch an aid record
router.get("/aid/:id", async (req, res) => {
    try {
        const record = await getAidRecord(req.params.id);
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: "Error fetching aid record" });
    }
});

// Add a new aid record (Admin Only)
router.post("/aid", async (req, res) => {
    try {
        const { recipient, aidType, amount } = req.body;
        const privateKey = process.env.ADMIN_PRIVATE_KEY;

        if (!privateKey) {
            return res.status(500).json({ error: "Admin private key missing in environment variables" });
        }

        const receipt = await addAidRecord(recipient, aidType, amount, privateKey);
        res.json({ message: "Aid record added successfully", transactionHash: receipt.transactionHash });
    } catch (error) {
        res.status(500).json({ error: "Error adding aid record" });
    }
});

// Update aid status (Admin Only)
router.put("/aid/:id", async (req, res) => {
    try {
        const { status } = req.body;
        const privateKey = process.env.ADMIN_PRIVATE_KEY;

        if (!privateKey) {
            return res.status(500).json({ error: "Admin private key missing in environment variables" });
        }

        const receipt = await updateAidStatus(req.params.id, status, privateKey);
        res.json({ message: "Aid status updated successfully", transactionHash: receipt.transactionHash });
    } catch (error) {
        res.status(500).json({ error: "Error updating aid status" });
    }
});

module.exports = router;
