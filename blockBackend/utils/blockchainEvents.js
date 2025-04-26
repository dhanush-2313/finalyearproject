const BlockchainEvent = require('../models/BlockchainEvent');
const logger = require('./logger');

/**
 * Store a blockchain event in the database
 */
exports.storeBlockchainEvent = async (eventData) => {
    try {
        const event = new BlockchainEvent(eventData);
        await event.save();
        logger.logInfo(`Blockchain event stored: ${eventData.type}, Hash: ${eventData.txHash || 'N/A'}`);
        return event;
    } catch (error) {
        logger.logError(`Failed to store blockchain event: ${error.message}`);
        throw error;
    }
};

/**
 * Update the status of a blockchain event
 */
exports.updateBlockchainEventStatus = async (txHash, status, updateData = {}) => {
    try {
        let event;
        if (txHash && !updateData._id) {
            // Find by transaction hash
            event = await BlockchainEvent.findOne({ txHash });
        } else if (updateData._id) {
            // Find by ID if provided
            event = await BlockchainEvent.findById(updateData._id);
        }

        if (!event) {
            throw new Error(`Event with transaction hash ${txHash} not found`);
        }

        // Update status and other fields
        event.status = status;
        
        if (updateData.txHash) {
            event.txHash = updateData.txHash;
        }
        
        if (updateData.blockNumber) {
            event.blockNumber = updateData.blockNumber;
        }
        
        if (updateData.gasUsed) {
            event.gasUsed = updateData.gasUsed;
        }
        
        if (updateData.error) {
            event.error = updateData.error;
        }

        await event.save();
        logger.logInfo(`Blockchain event updated: ${event.type}, Hash: ${event.txHash}, Status: ${status}`);
        return event;
    } catch (error) {
        logger.logError(`Failed to update blockchain event: ${error.message}`);
        throw error;
    }
};

/**
 * Setup event listeners to automatically store contract events
 * @param {Object} contracts - Contract instances
 * @param {string} adminUserId - Admin user ID for system events
 */
function setupEventListeners(contracts, adminUserId) {
    // AidDistribution events
    if (contracts.AidDistribution) {
        contracts.AidDistribution.on("AidDistributed", async (id, recipient, amount, event) => {
            await exports.storeBlockchainEvent({
                txHash: event.log.transactionHash,
                type: 'AidDistributed',
                status: 'CONFIRMED',
                data: { id: Number(id), recipient, amount: Number(amount) },
                initiatedBy: adminUserId,
                blockNumber: event.log.blockNumber
            });
        });
        
        contracts.AidDistribution.on("AidDonated", async (donor, amount, event) => {
            await exports.storeBlockchainEvent({
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
            await exports.storeBlockchainEvent({
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
            await exports.storeBlockchainEvent({
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
            await exports.storeBlockchainEvent({
                txHash: event.log.transactionHash,
                type: 'TaskAssigned',
                status: 'CONFIRMED',
                data: { taskId: Number(taskId), fieldWorker, description },
                initiatedBy: adminUserId,
                blockNumber: event.log.blockNumber
            });
        });
        
        contracts.FieldWorker.on("TaskCompleted", async (taskId, event) => {
            await exports.storeBlockchainEvent({
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
            await exports.storeBlockchainEvent({
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
            await exports.storeBlockchainEvent({
                txHash: event.log.transactionHash,
                type: 'AidStatusUpdated',
                status: 'CONFIRMED',
                data: { id: Number(id), status },
                initiatedBy: adminUserId,
                blockNumber: event.log.blockNumber
            });
        });
        
        contracts.AidContract.on("AidDistributed", async (recipient, aidType, amount, timestamp, event) => {
            await exports.storeBlockchainEvent({
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
            await exports.storeBlockchainEvent({
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
    storeBlockchainEvent: exports.storeBlockchainEvent,
    updateBlockchainEventStatus: exports.updateBlockchainEventStatus,
    setupEventListeners
};