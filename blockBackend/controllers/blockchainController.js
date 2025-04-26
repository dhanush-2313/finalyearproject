const { getContract } = require("../blockchain/gateway"); // Use ethers.js gateway
const { 
    addAidRecord, 
    queryAidRecord, 
    updateAidStatus, 
    getAllAidRecords, 
    verifyTransaction,
    processDonation
} = require('../blockchain/gateway');
const logger = require('../utils/logger');
const monitoring = require('../utils/monitoring');
const BlockchainEvent = require('../models/BlockchainEvent');
const { storeBlockchainEvent, updateBlockchainEventStatus } = require('../utils/blockchainEvents');
const User = require('../models/User');
const Refugee = require('../models/Refugee');
const { ethers } = require('ethers');

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
        let amountInWei;
        try {
            // Parse the amount as ETH and convert to wei
            amountInWei = ethers.parseEther(amount.toString());
            console.log(`Converting ${amount} ETH to ${amountInWei.toString()} wei`);
        } catch (error) {
            throw new Error(`Invalid amount format: ${error.message}`);
        }
        
        // Add to blockchain with increased gas limit and timeout
        const result = await addAidRecord(
            recipient, 
            aidType, 
            amountInWei.toString(),
            "ETH",
            "",
            { gasLimit: 500000 }
        );
        
        // Update event with transaction hash immediately
        if (pendingEvent && result.hash) {
            await updateBlockchainEventStatus(null, 'PENDING', {
                _id: pendingEvent._id,
                txHash: result.hash
            });
        }

        // Send initial success response
        res.status(201).json({
            success: true,
            txHash: result.hash,
            message: `Aid record submitted to blockchain`,
            status: 'PENDING'
        });
        
        // Wait for transaction receipt
        try {
            const provider = getContract('AidDistribution').provider;
            const receipt = await provider.waitForTransaction(result.hash, 2); // Wait for 2 confirmations
            
            if (receipt.status === 1) {
                // Transaction successful
                await updateBlockchainEventStatus(result.hash, 'CONFIRMED', {
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString()
                });
                
                logger.logInfo(`Aid record confirmed on blockchain: ${result.hash}`);
            } else {
                // Transaction failed
                await updateBlockchainEventStatus(result.hash, 'FAILED', {
                    error: 'Transaction reverted'
                });
                
                logger.logError(`Aid record transaction failed: ${result.hash}`);
            }
        } catch (confirmError) {
            logger.logError(`Error confirming transaction: ${confirmError.message}`);
            await updateBlockchainEventStatus(result.hash, 'FAILED', {
                error: confirmError.message
            });
        }
        
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
        
        // Only send error response if we haven't sent the success response yet
        if (!res.headersSent) {
            return res.status(500).json({ 
                success: false, 
                error: `Failed to add aid record: ${error.message}` 
            });
        }
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

        // For AidDistribution contract, non-final states are tracked off-chain
        const isOffChainStatus = result.hash === null && result.status === 'pending';
        
        // Send initial success response
        res.status(200).json({
            success: true,
            txHash: result.hash,
            message: isOffChainStatus ? 
                `Aid status updated to ${status} (tracked off-chain)` : 
                `Aid status update submitted to blockchain`,
            status: isOffChainStatus ? 'CONFIRMED' : 'PENDING'
        });

        // If there's a blockchain transaction, wait for confirmation
        if (result.hash) {
            try {
                const provider = getContract('AidDistribution').provider;
                const receipt = await provider.waitForTransaction(result.hash, 2);
                
                if (receipt.status === 1) {
                    await updateBlockchainEventStatus(result.hash, 'CONFIRMED', {
                        _id: pendingEvent._id,
                        blockNumber: receipt.blockNumber,
                        gasUsed: receipt.gasUsed.toString()
                    });
                    logger.logInfo(`Aid status update confirmed on blockchain: ${result.hash}`);
                } else {
                    await updateBlockchainEventStatus(result.hash, 'FAILED', {
                        _id: pendingEvent._id,
                        error: 'Transaction reverted'
                    });
                    logger.logError(`Aid status update failed: ${result.hash}`);
                }
            } catch (confirmError) {
                logger.logError(`Error confirming status update: ${confirmError.message}`);
                await updateBlockchainEventStatus(result.hash, 'FAILED', {
                    _id: pendingEvent._id,
                    error: confirmError.message
                });
            }
        } else if (isOffChainStatus) {
            // Update the event status for off-chain updates
            await updateBlockchainEventStatus(null, 'CONFIRMED', {
                _id: pendingEvent._id,
                data: { status, isOffChain: true }
            });
        }
    } catch (error) {
        logger.logError(`Error updating aid status: ${error.message}`);
        
        // Store failed event in database
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
                gasUsed: verification.gasUsed
            });
        } else if (verification.status === 'FAILED') {
            await updateBlockchainEventStatus(txHash, 'FAILED', {
                error: verification.message
            });
        }
        
        return res.status(200).json({
            success: true,
            verification: {
                ...verification,
                checkTime: new Date().toISOString()
            }
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

/**
 * Get user details by wallet address
 * This endpoint allows donors and admins to look up user details based on blockchain wallet addresses
 */
exports.getUserByWalletAddress = async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Wallet address is required'
            });
        }
        
        logger.logInfo(`Looking up user for wallet address: ${address}`);
        
        // Find the user with the given wallet address
        const user = await User.findOne({ walletAddress: address })
            .select('-password -mfaSecret'); // Exclude sensitive information
        
        // Return a successful response even if no user is found,
        // but include a flag indicating if the resolution was successful
        if (!user) {
            logger.logInfo(`No user found for wallet address: ${address}`);
            return res.status(200).json({
                success: true,
                resolved: false,
                data: {
                    address,
                    message: "No user associated with this wallet address"
                }
            });
        }
        
        let detailedInfo = { user, resolved: true };
        
        // If it's a refugee, fetch additional details from Refugee collection
        if (user.role === 'refugee') {
            const refugeeDetails = await Refugee.findOne({ user: user._id });
            if (refugeeDetails) {
                detailedInfo.refugeeDetails = refugeeDetails;
            }
        }
        
        logger.logInfo(`Successfully resolved wallet address: ${address} to user: ${user.name}`);
        
        return res.status(200).json({
            success: true,
            resolved: true,
            data: detailedInfo
        });
    } catch (error) {
        logger.logError(`Error fetching user by wallet address: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Failed to fetch user details: ${error.message}`
        });
    }
};

/**
 * Resolve multiple addresses to user details
 * Useful for resolving multiple addresses in aid records at once
 */
exports.resolveAddresses = async (req, res) => {
    try {
        const { addresses } = req.body;
        
        if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid array of wallet addresses is required'
            });
        }
        
        // Find all users with the given wallet addresses
        const users = await User.find({ walletAddress: { $in: addresses } })
            .select('-password -mfaSecret'); // Exclude sensitive information
        
        // Create a map of address to user details
        const addressMap = {};
        for (const user of users) {
            addressMap[user.walletAddress] = {
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            };
        }
        
        // For addresses that don't have a user, mark as unknown
        for (const address of addresses) {
            if (!addressMap[address]) {
                addressMap[address] = { status: 'unknown' };
            }
        }
        
        return res.status(200).json({
            success: true,
            resolvedAddresses: addressMap,
            totalResolved: Object.keys(addressMap).filter(addr => addressMap[addr].status !== 'unknown').length,
            totalUnknown: Object.keys(addressMap).filter(addr => addressMap[addr].status === 'unknown').length
        });
    } catch (error) {
        logger.logError(`Error resolving wallet addresses: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Failed to resolve addresses: ${error.message}`
        });
    }
};

/**
 * Enhance aid records with user details
 * This merges blockchain data with user information from the database
 */
exports.getEnhancedAidRecords = async (req, res) => {
    try {
        // Get all aid records
        const records = await getAllAidRecords();
        if (!records || !Array.isArray(records)) {
            return res.status(200).json({
                success: true,
                count: 0,
                records: []
            });
        }

        // Get all user addresses for resolution
        const allAddresses = records.reduce((addresses, record) => {
            if (record.addedBy) addresses.add(record.addedBy);
            if (record.recipient) addresses.add(record.recipient);
            return addresses;
        }, new Set());

        // Fetch user details for addresses
        const addressMap = new Map();
        for (const address of allAddresses) {
            try {
                const user = await User.findOne({ walletAddress: address });
                if (user) {
                    addressMap.set(address.toLowerCase(), {
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        avatarUrl: user.avatarUrl,
                        createdAt: user.createdAt,
                        additionalDetails: user.additionalDetails || {}
                    });
                }
            } catch (error) {
                logger.logWarning(`Failed to fetch user details for address ${address}: ${error.message}`);
            }
        }

        // Enhance records with user details
        const enhancedRecords = records.map(record => {
            const enhanced = { ...record };
            
            // Always ensure we have a timestamp
            const timestamp = record.timestamp ? Number(record.timestamp) : Math.floor(Date.now() / 1000);
            enhanced.timestamp = new Date(timestamp * 1000).toISOString();
            
            if (record.addedBy && addressMap.has(record.addedBy.toLowerCase())) {
                enhanced.addedByDetails = addressMap.get(record.addedBy.toLowerCase());
            }
            
            if (record.recipient && addressMap.has(record.recipient.toLowerCase())) {
                enhanced.recipientDetails = addressMap.get(record.recipient.toLowerCase());
            }
            
            return enhanced;
        });
        
        return res.status(200).json({
            success: true,
            count: enhancedRecords.length,
            records: enhancedRecords
        });
    } catch (error) {
        logger.logError(`Error fetching enhanced aid records: ${error.message}`);
        return res.status(200).json({  // Return 200 with empty array instead of error
            success: true,
            count: 0,
            records: []
        });
    }
};

/**
 * Get aid statistics for admin dashboard
 * This calculates total aid distributed and other metrics
 */
exports.getAidStats = async (req, res) => {
    try {
        // Get all aid records from blockchain
        const records = await getAllAidRecords();
        
        // Calculate total aid distributed in ETH
        let totalAid = ethers.getBigInt(0);
        let deliveredAid = ethers.getBigInt(0);
        let pendingAid = ethers.getBigInt(0);
        let activeProjects = 0;
        
        // Count unique recipients
        const uniqueRecipients = new Set();
        
        records.forEach(record => {
            if (record.amount) {
                const amountBN = ethers.getBigInt(record.amount.toString());
                totalAid = totalAid + amountBN;
                
                if (record.status === 'Delivered' || record.status === 'Verified') {
                    deliveredAid = deliveredAid + amountBN;
                } else if (record.status === 'Pending' || record.status === 'Approved' || record.status === 'In Transit') {
                    pendingAid = pendingAid + amountBN;
                    activeProjects++; // Count non-completed aid records as active projects
                }
            }
            
            if (record.recipient) {
                uniqueRecipients.add(record.recipient);
            }
        });
        
        return res.status(200).json({
            success: true,
            stats: {
                totalAid: ethers.formatEther(totalAid),
                deliveredAid: ethers.formatEther(deliveredAid),
                pendingAid: ethers.formatEther(pendingAid),
                totalRecords: records.length,
                uniqueRecipients: uniqueRecipients.size,
                activeProjects
            }
        });
    } catch (error) {
        logger.logError(`Error fetching aid statistics: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Failed to fetch aid statistics: ${error.message}`
        });
    }
};

exports.handleDonation = async (req, res) => {
    try {
        const { amount, donorName } = req.body;

        if (!amount) {
            return res.status(400).json({
                success: false,
                error: 'Amount is required'
            });
        }

        // Create a pending event before blockchain transaction
        const pendingEvent = await storeBlockchainEvent({
            txHash: null,
            type: 'DonationReceived',
            status: 'PENDING',
            data: { donor: req.user.id, amount, donorName },
            initiatedBy: req.user.id
        });

        // Process the donation through blockchain
        const result = await processDonation(amount, donorName);

        // Update event with transaction hash
        if (pendingEvent && result.hash) {
            await updateBlockchainEventStatus(null, 'PENDING', {
                _id: pendingEvent._id,
                txHash: result.hash
            });
        }

        // Send initial success response
        res.status(200).json({
            success: true,
            txHash: result.hash,
            message: 'Donation submitted to blockchain',
            status: 'PENDING'
        });

        // Wait for transaction receipt
        try {
            const receipt = await result.wait(2); // Wait for 2 confirmations
            
            if (receipt.status === 1) {
                // Transaction successful
                await updateBlockchainEventStatus(result.hash, 'CONFIRMED', {
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString()
                });
                
                logger.logInfo(`Donation confirmed on blockchain: ${result.hash}`);
            } else {
                // Transaction failed
                await updateBlockchainEventStatus(result.hash, 'FAILED', {
                    error: 'Transaction reverted'
                });
                
                logger.logError(`Donation transaction failed: ${result.hash}`);
            }
        } catch (confirmError) {
            logger.logError(`Error confirming donation: ${confirmError.message}`);
            await updateBlockchainEventStatus(result.hash, 'FAILED', {
                error: confirmError.message
            });
        }
    } catch (error) {
        logger.logError(`Error processing donation: ${error.message}`);
        
        // Store failed transaction in database
        if (req.user) {
            await storeBlockchainEvent({
                txHash: null,
                type: 'DonationReceived',
                status: 'FAILED',
                data: req.body,
                initiatedBy: req.user.id,
                error: error.message
            });
        }
        
        res.status(400).json({
            success: false,
            error: 'Failed to process donation',
            details: error.message
        });
    }
};
