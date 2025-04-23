const BlockchainEvent = require('../models/BlockchainEvent');
const logger = require('./logger');

/**
 * Store a blockchain event in the database
 * @param {Object} eventData - Event data to store
 * @param {string} eventData.txHash - Transaction hash
 * @param {string} eventData.type - Event type
 * @param {string} eventData.status - Event status
 * @param {Object} eventData.data - Event data
 * @param {string} eventData.initiatedBy - User ID who initiated the event
 * @returns {Promise<Object>} Stored event
 */
async function storeBlockchainEvent(eventData) {
    try {
        // Validate required fields
        if (!eventData.type || !eventData.data) {
            throw new Error('Event type and data are required');
        }

        // Create and save event
        const event = new BlockchainEvent(eventData);
        await event.save();
        
        logger.logInfo(`Blockchain event stored: ${eventData.type}, Hash: ${eventData.txHash || 'N/A'}`);
        return event;
    } catch (error) {
        logger.logError(`Failed to store blockchain event: ${error.message}`);
        // Don't throw - this is a non-critical operation
        return null;
    }
}

/**
 * Update a blockchain event status
 * @param {string} txHash - Transaction hash to update
 * @param {string} status - New status
 * @param {Object} additionalData - Additional data to update
 * @returns {Promise<Object>} Updated event
 */
async function updateBlockchainEventStatus(txHash, status, additionalData = {}) {
    try {
        if (!txHash) {
            throw new Error('Transaction hash is required');
        }

        const event = await BlockchainEvent.findOne({ txHash });
        if (!event) {
            throw new Error(`Event with transaction hash ${txHash} not found`);
        }

        event.status = status;
        
        // Update additional fields if provided
        if (additionalData.blockNumber) {
            event.blockNumber = additionalData.blockNumber;
        }
        
        if (additionalData.gasUsed) {
            event.gasUsed = additionalData.gasUsed;
        }
        
        if (additionalData.error) {
            event.error = additionalData.error;
        }
        
        await event.save();
        
        logger.logInfo(`Blockchain event updated: ${event.type}, Hash: ${txHash}, Status: ${status}`);
        return event;
    } catch (error) {
        logger.logError(`Failed to update blockchain event: ${error.message}`);
        return null;
    }
}

/**
 * Setup event listeners to automatically store contract events
 * @param {Object} contracts - Contract instances
 * @param {string} adminUserId - Admin user ID for system events
 */
function setupEventListeners(contracts, adminUserId) {
    // AidDistribution events
    if (contracts.AidDistribution) {
        contracts.AidDistribution.on("AidDistributed", async (id, recipient, amount, event) => {
            await storeBlockchainEvent({
                txHash: event.log.transactionHash,
                type: 'AidDistributed',
                status: 'CONFIRMED',
                data: { id: Number(id), recipient, amount: Number(amount) },
                initiatedBy: adminUserId,
                blockNumber: event.log.blockNumber
            });
        });
        
        contracts.AidDistribution.on("AidDonated", async (donor, amount, event) => {
            await storeBlockchainEvent({
                txHash: event.log.transactionHash,
                type: 'AidDonated',
                status: 'CONFIRMED',
                data: { donor, amount: Number(amount) },
                initiatedBy: adminUserId,
                blockNumber: event.log.blockNumber
            });
        });
    }
    
    // DonorTracking events
    if (contracts.DonorTracking) {
        contracts.DonorTracking.on("DonorUpdated", async (donor, totalDonated, event) => {
            await storeBlockchainEvent({
                txHash: event.log.transactionHash,
                type: 'DonorUpdated',
                status: 'CONFIRMED',
                data: { donor, totalDonated: Number(totalDonated) },
                initiatedBy: adminUserId,
                blockNumber: event.log.blockNumber
            });
        });
    }
    
    // RefugeeAccess events
    if (contracts.RefugeeAccess) {
        contracts.RefugeeAccess.on("RefugeeStatusUpdated", async (refugee, isEligibleForAid, event) => {
            await storeBlockchainEvent({
                txHash: event.log.transactionHash,
                type: 'RefugeeStatusUpdated',
                status: 'CONFIRMED',
                data: { refugee, isEligibleForAid },
                initiatedBy: adminUserId,
                blockNumber: event.log.blockNumber
            });
        });
    }
    
    // FieldWorker events
    if (contracts.FieldWorker) {
        contracts.FieldWorker.on("TaskAssigned", async (taskId, fieldWorker, description, event) => {
            await storeBlockchainEvent({
                txHash: event.log.transactionHash,
                type: 'TaskAssigned',
                status: 'CONFIRMED',
                data: { taskId: Number(taskId), fieldWorker, description },
                initiatedBy: adminUserId,
                blockNumber: event.log.blockNumber
            });
        });
        
        contracts.FieldWorker.on("TaskCompleted", async (taskId, event) => {
            await storeBlockchainEvent({
                txHash: event.log.transactionHash,
                type: 'TaskCompleted',
                status: 'CONFIRMED',
                data: { taskId: Number(taskId) },
                initiatedBy: adminUserId,
                blockNumber: event.log.blockNumber
            });
        });
    }
    
    // AidContract events
    if (contracts.AidContract) {
        contracts.AidContract.on("AidAdded", async (id, recipient, aidType, amount, status, addedBy, event) => {
            await storeBlockchainEvent({
                txHash: event.log.transactionHash,
                type: 'AidAdded',
                status: 'CONFIRMED',
                data: { 
                    id: Number(id), 
                    recipient, 
                    aidType, 
                    amount: Number(amount), 
                    status, 
                    addedBy 
                },
                initiatedBy: adminUserId,
                blockNumber: event.log.blockNumber
            });
        });
        
        contracts.AidContract.on("AidUpdated", async (id, status, event) => {
            await storeBlockchainEvent({
                txHash: event.log.transactionHash,
                type: 'AidStatusUpdated',
                status: 'CONFIRMED',
                data: { id: Number(id), status },
                initiatedBy: adminUserId,
                blockNumber: event.log.blockNumber
            });
        });
        
        contracts.AidContract.on("AidDistributed", async (recipient, aidType, amount, timestamp, event) => {
            await storeBlockchainEvent({
                txHash: event.log.transactionHash,
                type: 'AidDistributed',
                status: 'CONFIRMED',
                data: { 
                    recipient, 
                    aidType, 
                    amount: Number(amount), 
                    timestamp: Number(timestamp) * 1000 
                },
                initiatedBy: adminUserId,
                blockNumber: event.log.blockNumber
            });
        });
        
        contracts.AidContract.on("DonationReceived", async (donor, name, amount, event) => {
            await storeBlockchainEvent({
                txHash: event.log.transactionHash,
                type: 'DonationReceived',
                status: 'CONFIRMED',
                data: { donor, name, amount: Number(amount) },
                initiatedBy: adminUserId,
                blockNumber: event.log.blockNumber
            });
        });
    }
    
    logger.logInfo("✅ Blockchain event listeners set up for database storage");
}

module.exports = {
    storeBlockchainEvent,
    updateBlockchainEventStatus,
    setupEventListeners
}; 