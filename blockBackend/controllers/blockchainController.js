const { getContract } = require("../blockchain/gateway"); // Use ethers.js gateway
const { 
    addAidRecord, 
    queryAidRecord, 
    updateAidStatus, 
    getAllAidRecords, 
    verifyTransaction
} = require('../blockchain/gateway');
const logger = require('../utils/logger');
const monitoring = require('../utils/monitoring');
const BlockchainEvent = require('../models/BlockchainEvent');
const { storeBlockchainEvent, updateBlockchainEventStatus } = require('../utils/blockchainEvents');

exports.getLatestBlock = async (req, res) => {
  try {
    const contract = getContract('AidDistribution');
    const blockNumber = await contract.provider.getBlockNumber();
    res.json({ blockNumber });
  } catch (error) {
    logger.logError(`Error fetching latest block: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch block number" });
  }
};

exports.addAid = async (req, res) => {
    try {
        const { recipient, aidType, amount } = req.body;
        
        // Validate input
        if (!recipient || !aidType || !amount) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: recipient, aidType, and amount are required' 
            });
        }
        
        // Create a pending event before blockchain transaction
        const pendingEvent = await storeBlockchainEvent({
            txHash: null,
            type: 'AidAdded',
            status: 'PENDING',
            data: { recipient, aidType, amount },
            initiatedBy: req.user.id
        });
        
        // Import ethers and convert amount to wei
        const { ethers } = require('ethers');
        let amountInWei;
        try {
            // Parse the amount as ETH and convert to wei
            amountInWei = ethers.parseEther(amount.toString());
            console.log(`Converting ${amount} ETH to ${amountInWei.toString()} wei`);
        } catch (error) {
            throw new Error(`Invalid amount format: ${error.message}`);
        }
        
        // Add to blockchain - pass the amount as a string to preserve precision
        const result = await addAidRecord(recipient, aidType, amountInWei.toString());
        
        // Update event with transaction hash
        if (pendingEvent) {
            await updateBlockchainEventStatus(null, 'CONFIRMED', {
                _id: pendingEvent._id,
                txHash: result.hash,
                blockNumber: result.receipt.blockNumber,
                gasUsed: result.receipt.gasUsed
            });
        }
        
        return res.status(201).json({
            success: true,
            txHash: result.hash,
            message: `Aid record added to blockchain successfully`,
            blockNumber: result.receipt.blockNumber
        });
    } catch (error) {
        logger.logError(`Error adding aid record to blockchain: ${error.message}`);
        
        // Store failed transaction in database
        if (req.user && req.body) {
            await storeBlockchainEvent({
                txHash: null,
                type: 'AidAdded',
                status: 'FAILED',
                data: req.body,
                initiatedBy: req.user.id,
                error: error.message
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            error: `Failed to add aid record: ${error.message}` 
        });
    }
};

exports.updateAidStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Validate input
        if (!id || !status) {
            return res.status(400).json({ 
                success: false, 
                error: 'Aid ID and status are required' 
            });
        }
        
        // Validate status
        const validStatuses = ['Pending', 'Approved', 'In Transit', 'Delivered', 'Verified', 'Rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                error: `Invalid status. Allowed values: ${validStatuses.join(', ')}` 
            });
        }
        
        // Create a pending event before blockchain transaction
        const pendingEvent = await storeBlockchainEvent({
            txHash: null,
            type: 'AidStatusUpdated',
            status: 'PENDING',
            data: { id, status },
            initiatedBy: req.user.id
        });
        
        // Update on blockchain
        const result = await updateAidStatus(id, status);
        
        // Update event with transaction hash
        if (pendingEvent) {
            await updateBlockchainEventStatus(null, 'CONFIRMED', {
                _id: pendingEvent._id,
                txHash: result.hash,
                blockNumber: result.receipt.blockNumber,
                gasUsed: result.receipt.gasUsed
            });
        }
        
        return res.status(200).json({
            success: true,
            txHash: result.hash,
            message: `Aid status updated successfully`,
            blockNumber: result.receipt.blockNumber
        });
    } catch (error) {
        logger.logError(`Error updating aid status on blockchain: ${error.message}`);
        
        // Store failed transaction in database
        if (req.user && req.params.id && req.body) {
            await storeBlockchainEvent({
                txHash: null,
                type: 'AidStatusUpdated',
                status: 'FAILED',
                data: { id: req.params.id, status: req.body.status },
                initiatedBy: req.user.id,
                error: error.message
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            error: `Failed to update aid status: ${error.message}` 
        });
    }
};

exports.getAidRecord = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ 
                success: false, 
                error: 'Aid ID is required' 
            });
        }
        
        const record = await queryAidRecord(id);
        
        return res.status(200).json({
            success: true,
            record
        });
    } catch (error) {
        logger.logError(`Error fetching aid record from blockchain: ${error.message}`);
        
        // If record not found, return 404
        if (error.message.includes('not found')) {
            return res.status(404).json({ 
                success: false, 
                error: `Aid record not found: ${error.message}` 
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            error: `Failed to fetch aid record: ${error.message}` 
        });
    }
};

exports.getAllAidRecords = async (req, res) => {
    try {
        const records = await getAllAidRecords();
        
        return res.status(200).json({
            success: true,
            count: records.length,
            records
        });
    } catch (error) {
        logger.logError(`Error fetching all aid records from blockchain: ${error.message}`);
        return res.status(500).json({ 
            success: false, 
            error: `Failed to fetch aid records: ${error.message}` 
        });
    }
};

exports.verifyTransaction = async (req, res) => {
    try {
        const { txHash } = req.params;
        
        if (!txHash) {
            return res.status(400).json({ 
                success: false, 
                error: 'Transaction hash is required' 
            });
        }
        
        const verification = await verifyTransaction(txHash);
        
        // If transaction is verified, update any matching event
        if (verification.verified) {
            await updateBlockchainEventStatus(txHash, 'CONFIRMED', {
                blockNumber: verification.blockNumber,
                gasUsed: verification.receipt.gasUsed
            });
        }
        
        return res.status(200).json({
            success: true,
            verification
        });
    } catch (error) {
        logger.logError(`Error verifying transaction: ${error.message}`);
        return res.status(500).json({ 
            success: false, 
            error: `Failed to verify transaction: ${error.message}` 
        });
    }
};

exports.getRecentEvents = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const events = await BlockchainEvent.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('initiatedBy', 'name email role');
            
        return res.status(200).json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        logger.logError(`Error fetching blockchain events: ${error.message}`);
        return res.status(500).json({ 
            success: false, 
            error: `Failed to fetch blockchain events: ${error.message}` 
        });
    }
};

// Get events by type
exports.getEventsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        
        const events = await BlockchainEvent.find({ type })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('initiatedBy', 'name email role');
            
        return res.status(200).json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        logger.logError(`Error fetching blockchain events by type: ${error.message}`);
        return res.status(500).json({ 
            success: false, 
            error: `Failed to fetch blockchain events: ${error.message}` 
        });
    }
};
