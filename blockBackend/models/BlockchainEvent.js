const mongoose = require('mongoose');

const BlockchainEventSchema = new mongoose.Schema({
    txHash: {
        type: String,
        trim: true,
        // Can be null for failed transactions that never reached the chain
        required: false
    },
    type: {
        type: String,
        required: true,
        enum: [
            // AidContract events
            'AidAdded', 
            'AidStatusUpdated', 
            'AidDistributed', 
            'DonationReceived',
            
            // AidDistribution events 
            'AidDonated',
            
            // DonorTracking events
            'DonorUpdated',
            
            // RefugeeAccess events
            'RefugeeStatusUpdated',
            
            // FieldWorker events
            'TaskAssigned',
            'TaskCompleted',
            
            // Other events
            'UserRegistered', 
            'Other'
        ]
    },
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'CONFIRMED', 'FAILED'],
        default: 'PENDING'
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    blockNumber: {
        type: Number,
        required: false
    },
    gasUsed: {
        type: Number,
        required: false
    },
    error: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create indexes for better query performance
BlockchainEventSchema.index({ txHash: 1 });
BlockchainEventSchema.index({ type: 1 });
BlockchainEventSchema.index({ status: 1 });
BlockchainEventSchema.index({ initiatedBy: 1 });
BlockchainEventSchema.index({ createdAt: -1 });

// Pre-save hook to update the updatedAt field
BlockchainEventSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('BlockchainEvent', BlockchainEventSchema);

