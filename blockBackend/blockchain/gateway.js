const { ethers } = require("ethers");
const path = require('path');
const fs = require('fs');
const monitoring = require('../utils/monitoring');
const logger = require('../utils/logger');
require('dotenv').config();

// Load environment variables
const { PROVIDER_URL, ADMIN_PRIVATE_KEY, BLOCKCHAIN_RPC_URL } = process.env;

// Contracts configuration
const CONTRACTS = {
    AidDistribution: {
        address: "0x1b4bF77EE4Ab26f3f508510b5B3568db7C9f8316",
        path: "../../blockchain/artifacts/contracts/AidDistribution.sol/AidDistribution.json"
    },
    DonorTracking: {
        address: "0x1d6224C17402Aac3e19d4cCb4A730E063a05F011",
        path: "../../blockchain/artifacts/contracts/DonorTracking.sol/DonorTracking.json"
    },
    RefugeeAccess: {
        address: "0x5cA2850142FF9c4b11Aa8A3F46cF0182A2B6E7A7",
        path: "../../blockchain/artifacts/contracts/RefugeeAccess.sol/RefugeeAccess.json"
    },
    FieldWorker: {
        address: "0x1E2be53982AE3eED2b372519be2711750ee87c48",
        path: "../../blockchain/artifacts/contracts/FieldWorker.sol/FieldWorker.json"
    },
    AidContract: {
        address: process.env.CONTRACT_ADDRESS, // Use this only if it's deployed
        path: "../../blockchain/artifacts/contracts/AidContract.sol/AidContract.json"
    }
};

// Connect to Ethereum provider
let provider;
let wallet;
let contracts = {};

// Load contract ABIs
const loadContractABIs = () => {
    let loadedContracts = {};
    
    Object.keys(CONTRACTS).forEach(contractName => {
        try {
            const contractPath = path.resolve(__dirname, CONTRACTS[contractName].path);
            if (fs.existsSync(contractPath)) {
                const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
                loadedContracts[contractName] = {
                    address: CONTRACTS[contractName].address,
                    abi: contractJson.abi
                };
                logger.logInfo(`✅ Loaded ABI for ${contractName}`);
            } else {
                logger.logWarning(`⚠️ Contract artifact not found for ${contractName}: ${contractPath}`);
            }
        } catch (error) {
            logger.logError(`❌ Failed to load ABI for ${contractName}: ${error.message}`);
        }
    });
    
    return loadedContracts;
};

// Initialize connection with retry mechanism
const initializeConnection = async (retries = 5) => {
    try {
        provider = new ethers.JsonRpcProvider(BLOCKCHAIN_RPC_URL);
        await provider.getNetwork(); // Test the connection
        
        wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
        
        // Load contract ABIs
        const contractConfigs = loadContractABIs();
        
        // Initialize contract instances
        Object.keys(contractConfigs).forEach(contractName => {
            const config = contractConfigs[contractName];
            if (config.address && config.abi) {
                contracts[contractName] = new ethers.Contract(config.address, config.abi, wallet);
                logger.logInfo(`✅ Connected to ${contractName} contract at ${config.address}`);
            }
        });
        
        logger.logInfo('✅ Connected to Ethereum Blockchain');
        return true;
    } catch (error) {
        if (retries > 0) {
            logger.logError(`❌ Failed to connect to Ethereum network, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
            return initializeConnection(retries - 1);
        } else {
            logger.logError(`❌ Failed to connect to Ethereum network after multiple attempts: ${error.message}`);
            throw error;
        }
    }
};

// Initialize connection when module is loaded
initializeConnection().catch(err => {
    logger.logError(`Initial blockchain connection failed: ${err.message}`);
});

// Transaction wrapper with retry mechanism
const executeTransaction = async (contractName, methodName, ...args) => {
    // Record the transaction attempt in metrics
    monitoring.metrics.contractCallsTotal.inc({ method: methodName, contract: contractName });
    
    // Check if contract exists
    if (!contracts[contractName]) {
        throw new Error(`Contract ${contractName} not found or not initialized`);
    }
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
        try {
            // Ensure connection is active
            if (!provider || !contracts[contractName]) {
                await initializeConnection();
            }
            
            // Execute the transaction
            const tx = await contracts[contractName][methodName](...args);
            
            // Wait for transaction to be mined with a timeout
            const receipt = await tx.wait(2); // Wait with 2 confirmations
            
            logger.logInfo(`✅ Transaction successful: Contract=${contractName}, Method=${methodName}, Hash=${tx.hash}`);
            return { success: true, hash: tx.hash, receipt };
        } catch (error) {
            attempts++;
            
            // Check if it's a network issue
            if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT' || 
                error.message.includes('network') || error.message.includes('timeout')) {
                logger.logError(`❌ Network error in ${contractName}.${methodName}, attempt ${attempts}/${maxAttempts}: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Increasing backoff
                await initializeConnection(1); // Try to reconnect
            } 
            // Check if it's a nonce error
            else if (error.message.includes('nonce') || error.message.includes('replacement')) {
                logger.logError(`❌ Nonce error in ${contractName}.${methodName}, attempt ${attempts}/${maxAttempts}: ${error.message}`);
                
                // Reset the connection to get a fresh nonce
                await initializeConnection(1);
            } 
            // If we've tried maximum attempts or it's a different error, throw it
            else if (attempts >= maxAttempts) {
                logger.logError(`❌ Transaction failed after ${maxAttempts} attempts: ${error.message}`);
                throw error;
            } else {
                logger.logError(`❌ Transaction error in ${contractName}.${methodName}, attempt ${attempts}/${maxAttempts}: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
            }
        }
    }
    
    throw new Error(`Failed to execute ${contractName}.${methodName} after ${maxAttempts} attempts`);
};

// Call view function (no transaction)
const callViewFunction = async (contractName, methodName, ...args) => {
    try {
        if (!provider || !contracts[contractName]) {
            await initializeConnection();
        }
        
        monitoring.metrics.contractCallsTotal.inc({ method: methodName, contract: contractName });
        return await contracts[contractName][methodName](...args);
    } catch (error) {
        logger.logError(`❌ Error calling ${contractName}.${methodName}: ${error.message}`);
        
        // If it's a connection issue, try to reconnect
        if (error.code === 'NETWORK_ERROR' || error.message.includes('network')) {
            await initializeConnection(1);
            // Try once more after reconnection
            return await contracts[contractName][methodName](...args);
        }
        
        throw error;
    }
};

// Function to add an aid record
const addAidRecord = async (recipient, aidType, amount) => {
    // Try using AidContract first, fallback to AidDistribution
    const contractName = contracts.AidContract ? 'AidContract' : 'AidDistribution';
    
    logger.logInfo(`Using contract: ${contractName} for addAidRecord`);
    logger.logInfo(`Contract addresses: AidContract=${contracts.AidContract?.target}, AidDistribution=${contracts.AidDistribution?.target}`);
    
    if (contractName === 'AidContract') {
        logger.logInfo(`Calling AidContract.addAidRecord with params: recipient=${recipient}, aidType=${aidType}, amount=${amount}`);
        return executeTransaction('AidContract', 'addAidRecord', recipient, aidType, amount);
    } else {
        // AidDistribution contract uses createAidRecord with different parameter order (description, amount, recipient)
        logger.logInfo(`Calling AidDistribution.createAidRecord with params: description=${aidType}, amount=${amount}, recipient=${recipient}`);
        return executeTransaction('AidDistribution', 'createAidRecord', aidType, amount, recipient);
    }
};

// Function to update aid status
const updateAidStatus = async (id, status) => {
    // Try using AidContract first, fallback to AidDistribution
    const contractName = contracts.AidContract ? 'AidContract' : 'AidDistribution';
    
    if (contractName === 'AidContract') {
        return executeTransaction('AidContract', 'updateAidStatus', id, status);
    } else {
        // Check if this is a distribution status update
        if (status.toLowerCase() === 'distributed') {
            return executeTransaction('AidDistribution', 'distributeAid', id);
        } else {
            throw new Error('AidDistribution contract only supports marking records as distributed');
        }
    }
};

// Function to query a specific aid record by ID
const queryAidRecord = async (id) => {
    try {
        // Try using AidContract first, fallback to AidDistribution
        const contractName = contracts.AidContract ? 'AidContract' : 'AidDistribution';
        
        if (contractName === 'AidContract') {
            const record = await callViewFunction('AidContract', 'getAidRecord', id);
            
            return {
                id: Number(record[0]),
                recipient: record[1],
                aidType: record[2],
                amount: Number(record[3]),
                status: record[4],
                addedBy: record[5],
                timestamp: Number(record[6]) * 1000
            };
        } else {
            const record = await callViewFunction('AidDistribution', 'getAidRecord', id);
            
            return {
                id: Number(record.id),
                recipient: record.recipient,
                aidType: "Aid Distribution", // Default value
                amount: Number(record.amount),
                status: record.distributed ? "Distributed" : "Pending",
                addedBy: "0x0", // Not available in AidDistribution
                timestamp: Date.now() // Not available in AidDistribution
            };
        }
    } catch (error) {
        logger.logError(`❌ Error fetching aid record [ID: ${id}]: ${error.message}`);
        
        // Check if it's a valid error about non-existent record
        if (error.message.includes('Record not found') || error.message.includes('invalid aid ID')) {
            throw new Error(`Aid record with ID ${id} not found`);
        }
        
        throw error;
    }
};

// Function to get all aid records
const getAllAidRecords = async () => {
    try {
        // Try using AidContract first, fallback to AidDistribution
        const contractName = contracts.AidContract ? 'AidContract' : 'AidDistribution';
        
        if (contractName === 'AidContract') {
            const records = await callViewFunction('AidContract', 'getAllAidRecords');
            
            return records.map(record => ({
                id: Number(record.id),
                recipient: record.recipient,
                aidType: record.aidType,
                amount: Number(record.amount),
                status: record.status,
                addedBy: record.addedBy,
                timestamp: Number(record.timestamp) * 1000
            }));
        } else {
            // AidDistribution doesn't have a getAllAidRecords method
            // We need to manually query records by ID
            const nextId = await callViewFunction('AidDistribution', 'nextId');
            const records = [];
            
            for (let i = 0; i < nextId; i++) {
                try {
                    const record = await callViewFunction('AidDistribution', 'getAidRecord', i);
                    records.push({
                        id: Number(record.id),
                        recipient: record.recipient,
                        aidType: "Aid Distribution", // Default value
                        amount: Number(record.amount),
                        status: record.distributed ? "Distributed" : "Pending",
                        addedBy: "0x0", // Not available in AidDistribution
                        timestamp: Date.now() // Not available in AidDistribution
                    });
                } catch (error) {
                    // Skip non-existent records
                    continue;
                }
            }
            
            return records;
        }
    } catch (error) {
        logger.logError(`❌ Error fetching all aid records: ${error.message}`);
        throw error;
    }
};

// Function to listen for blockchain events
const getBlockchainEvents = async () => {
    try {
        await initializeConnection();
        
        // Set up event listeners for each contract
        // AidDistribution events
        if (contracts.AidDistribution) {
            contracts.AidDistribution.on("AidDistributed", (id, recipient, amount) => {
                const event = {
                    id: Number(id),
                    recipient,
                    amount: Number(amount),
                    eventType: "AidDistributed"
                };
                
                logger.logInfo(`📢 AidDistributed Event: ${JSON.stringify(event)}`);
                // Here you could add code to store the event in your database
            });
            
            contracts.AidDistribution.on("AidDonated", (donor, amount) => {
                const event = {
                    donor,
                    amount: Number(amount),
                    eventType: "AidDonated"
                };
                
                logger.logInfo(`📢 AidDonated Event: ${JSON.stringify(event)}`);
                // Here you could add code to store the event in your database
            });
        }
        
        // DonorTracking events
        if (contracts.DonorTracking) {
            contracts.DonorTracking.on("DonorUpdated", (donor, totalDonated) => {
                const event = {
                    donor,
                    totalDonated: Number(totalDonated),
                    eventType: "DonorUpdated"
                };
                
                logger.logInfo(`📢 DonorUpdated Event: ${JSON.stringify(event)}`);
                // Here you could add code to store the event in your database
            });
        }
        
        // RefugeeAccess events
        if (contracts.RefugeeAccess) {
            contracts.RefugeeAccess.on("RefugeeStatusUpdated", (refugee, isEligibleForAid) => {
                const event = {
                    refugee,
                    isEligibleForAid,
                    eventType: "RefugeeStatusUpdated"
                };
                
                logger.logInfo(`📢 RefugeeStatusUpdated Event: ${JSON.stringify(event)}`);
                // Here you could add code to store the event in your database
            });
        }
        
        // FieldWorker events
        if (contracts.FieldWorker) {
            contracts.FieldWorker.on("TaskAssigned", (taskId, fieldWorker, description) => {
                const event = {
                    taskId: Number(taskId),
                    fieldWorker,
                    description,
                    eventType: "TaskAssigned"
                };
                
                logger.logInfo(`📢 TaskAssigned Event: ${JSON.stringify(event)}`);
                // Here you could add code to store the event in your database
            });
            
            contracts.FieldWorker.on("TaskCompleted", (taskId) => {
                const event = {
                    taskId: Number(taskId),
                    eventType: "TaskCompleted"
                };
                
                logger.logInfo(`📢 TaskCompleted Event: ${JSON.stringify(event)}`);
                // Here you could add code to store the event in your database
            });
        }
        
        // AidContract events (if deployed)
        if (contracts.AidContract) {
            contracts.AidContract.on("AidAdded", (id, recipient, aidType, amount, status, addedBy) => {
                const event = {
                    id: Number(id),
                    recipient,
                    aidType,
                    amount: Number(amount),
                    status,
                    addedBy,
                    eventType: "AidAdded"
                };
                
                logger.logInfo(`📢 Aid Added Event: ${JSON.stringify(event)}`);
                // Here you could add code to store the event in your database
            });
            
            contracts.AidContract.on("AidUpdated", (id, status) => {
                const event = {
                    id: Number(id),
                    status,
                    eventType: "AidUpdated"
                };
                
                logger.logInfo(`📢 Aid Updated Event: ID=${id}, New Status=${status}`);
                // Here you could add code to store the event in your database
            });
            
            contracts.AidContract.on("AidDistributed", (recipient, aidType, amount, timestamp) => {
                const event = {
                    recipient,
                    aidType,
                    amount: Number(amount),
                    timestamp: Number(timestamp) * 1000,
                    eventType: "AidDistributed"
                };
                
                logger.logInfo(`📢 Aid Distributed Event: ${JSON.stringify(event)}`);
                // Here you could add code to store the event in your database
            });
            
            contracts.AidContract.on("DonationReceived", (donor, name, amount) => {
                const event = {
                    donor,
                    name,
                    amount: Number(amount),
                    eventType: "DonationReceived"
                };
                
                logger.logInfo(`📢 Donation Received Event: ${JSON.stringify(event)}`);
                // Here you could add code to store the event in your database
            });
        }
        
        logger.logInfo("✅ Listening for blockchain events...");
    } catch (error) {
        logger.logError(`❌ Error setting up event listeners: ${error.message}`);
        
        // If it's a connection issue, try to reconnect
        if (error.code === 'NETWORK_ERROR' || error.message.includes('network')) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            return getBlockchainEvents(); // Try again
        }
        
        throw error;
    }
};

const removeBlockchainEventListeners = () => {
    Object.keys(contracts).forEach(contractName => {
        if (contracts[contractName]) {
            contracts[contractName].removeAllListeners();
        }
    });
    logger.logInfo("✅ Stopped listening for blockchain events");
};

// Function to verify a transaction hash
const verifyTransaction = async (txHash) => {
    try {
        if (!provider) {
            await initializeConnection();
        }
        
        const tx = await provider.getTransaction(txHash);
        if (!tx) {
            return { verified: false, reason: 'Transaction not found' };
        }
        
        const receipt = await provider.getTransactionReceipt(txHash);
        return { 
            verified: receipt && receipt.status === 1,
            receipt,
            blockNumber: receipt ? receipt.blockNumber : null,
            blockTimestamp: receipt ? (await provider.getBlock(receipt.blockNumber)).timestamp * 1000 : null
        };
    } catch (error) {
        logger.logError(`❌ Error verifying transaction ${txHash}: ${error.message}`);
        return { verified: false, reason: error.message };
    }
};

// Check blockchain health
const checkBlockchainHealth = async () => {
    try {
        if (!provider) {
            await initializeConnection();
        }
        
        const blockNumber = await provider.getBlockNumber();
        const chainId = (await provider.getNetwork()).chainId;
        
        // Check contract connections
        const contractStatuses = {};
        for (const contractName in contracts) {
            try {
                // Try a simple call to check if contract is responsive
                if (contractName === 'AidDistribution') {
                    await contracts[contractName].nextId();
                } else if (contractName === 'AidContract' && contracts[contractName]) {
                    await contracts[contractName].recordCount();
                }
                contractStatuses[contractName] = "Connected";
            } catch (error) {
                contractStatuses[contractName] = `Error: ${error.message}`;
            }
        }
        
        return {
            connected: true,
            blockNumber,
            chainId: chainId.toString(),
            contracts: contractStatuses,
            providerUrl: BLOCKCHAIN_RPC_URL
        };
    } catch (error) {
        logger.logError(`❌ Blockchain health check failed: ${error.message}`);
        return {
            connected: false,
            error: error.message
        };
    }
};

// Helper function to get contract instance
const getContract = (contractName) => {
    if (!contracts[contractName]) {
        throw new Error(`Contract ${contractName} not found or not initialized`);
    }
    return contracts[contractName];
};

// Export functions
module.exports = { 
    getContract,
    addAidRecord, 
    updateAidStatus,
    queryAidRecord, 
    getAllAidRecords,
    getBlockchainEvents, 
    removeBlockchainEventListeners,
    verifyTransaction,
    checkBlockchainHealth
};
