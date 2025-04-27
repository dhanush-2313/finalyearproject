const { ethers } = require("ethers");
const path = require('path');
const fs = require('fs');
const monitoring = require('../utils/monitoring');
const logger = require('../utils/logger');
const { rpcUrl } = require('../config/blockchainConfig');
require('dotenv').config();

// Load environment variables
const { ADMIN_PRIVATE_KEY } = process.env;

// Contracts configuration
const CONTRACTS = {
    AidDistribution: {
        address: "0xE94a8c2f516DFCf1AC911fF950f6FBd1FE4f63d2",
        abiPath: path.join(__dirname, '../../blockchain/artifacts/contracts/AidDistribution.sol/AidDistribution.json')
    },
    DonorTracking: {
        address: "0xf6F39f608B06a16468e997D939846b3DeeB24d1b",
        abiPath: path.join(__dirname, '../../blockchain/artifacts/contracts/DonorTracking.sol/DonorTracking.json')
    },
    RefugeeAccess: {
        address: "0xb7496E0aC913a246A5a2d272B4CC493d1b962971",
        abiPath: path.join(__dirname, '../../blockchain/artifacts/contracts/RefugeeAccess.sol/RefugeeAccess.json')
    },
    FieldWorker: {
        address: "0x5c3F66d2d21993fdA4673757D94AfB82982D07E7",
        abiPath: path.join(__dirname, '../../blockchain/artifacts/contracts/FieldWorker.sol/FieldWorker.json')
    },
    AidContract: {
        address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        abiPath: path.join(__dirname, '../../blockchain/artifacts/contracts/AidContract.sol/AidContract.json')
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
            const contractPath = path.resolve(__dirname, CONTRACTS[contractName].abiPath);
            if (fs.existsSync(contractPath)) {
                const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
                loadedContracts[contractName] = {
                    address: CONTRACTS[contractName].address,
                    abi: contractJson.abi
                };
                logger.info(`✅ Loaded ABI for ${contractName}`);
            } else {
                logger.warn(`⚠️ Contract artifact not found for ${contractName}: ${contractPath}`);
            }
        } catch (error) {
            logger.error(`❌ Failed to load ABI for ${contractName}: ${error.message}`);
        }
    });
    
    return loadedContracts;
};

// Initialize connection with retry mechanism
const initializeConnection = async (retries = 5) => {
    try {
        // Configure provider with proper transaction handling
        provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
            polling: true,
            pollingInterval: 1000, // Poll every second
            timeout: 60000, // 60 second timeout
        });
        
        await provider.getNetwork(); // Test the connection
        
        // Configure the wallet with the configured provider
        wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
        
        // Load contract ABIs
        const contractConfigs = loadContractABIs();
        
        // Initialize contract instances with configured provider/wallet
        Object.keys(contractConfigs).forEach(contractName => {
            const config = contractConfigs[contractName];
            if (config.address && config.abi) {
                contracts[contractName] = new ethers.Contract(
                    config.address, 
                    config.abi, 
                    wallet
                );
                logger.info(`✅ Connected to ${contractName} contract at ${config.address}`);
            }
        });
        
        logger.info('✅ Connected to Ethereum Blockchain');
        return true;
    } catch (error) {
        if (retries > 0) {
            logger.error(`❌ Failed to connect to Ethereum network, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
            return initializeConnection(retries - 1);
        } else {
            logger.error(`❌ Failed to connect to Ethereum network after multiple attempts: ${error.message}`);
            throw error;
        }
    }
};

// Initialize connection when module is loaded
initializeConnection().catch(err => {
    logger.error(`Initial blockchain connection failed: ${err.message}`);
});

// Execute transaction with confirmation
const executeTransaction = async (contractName, methodName, ...args) => {
    try {
        if (!contracts[contractName]) {
            throw new Error(`Contract ${contractName} not found or not initialized`);
        }

        // Check if the last argument is a transaction options object
        const hasOptions = args.length > 0 && 
                          typeof args[args.length - 1] === 'object' && 
                          (args[args.length - 1].value !== undefined || 
                           args[args.length - 1].gasLimit !== undefined);

        // Separate options from regular arguments if present
        const options = hasOptions ? args.pop() : {};
        
        logger.info(`Executing ${contractName}.${methodName} with args:`, args, 'options:', options);

        // Execute the transaction with proper options
        const tx = await contracts[contractName][methodName](...args, options);
        logger.info(`✅ Transaction submitted: Contract=${contractName}, Method=${methodName}, Hash=${tx.hash}`);
        
        // Return transaction info immediately
        return {
            success: true,
            hash: tx.hash,
            wait: async (confirmations = 1) => {
                const receipt = await tx.wait(confirmations);
                return receipt;
            }
        };
    } catch (error) {
        logger.error(`❌ Transaction failed: Contract=${contractName}, Method=${methodName}, Error=${error.message}`);
        throw error;
    }
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
        logger.error(`❌ Error calling ${contractName}.${methodName}: ${error.message}`);
        
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
const addAidRecord = async (recipient, aidType, amount, paymentMethod = "ETH", paymentDetails = "", options = {}) => {
    try {
        logger.info(`Creating aid record with AidDistribution: description=${aidType}, amount=${amount}, recipient=${recipient}`);
        return executeTransaction(
            'AidDistribution', 
            'createAidRecord',
            aidType, // description
            amount,  // amount 
            recipient, // recipient address
            { 
                ...options, 
                gasLimit: options.gasLimit || 500000,
                gasPrice: options.gasPrice || undefined
            }
        );
    } catch (error) {
        logger.error(`Error in addAidRecord: ${error.message}`);
        throw error;
    }
};

// Function to update aid status
const updateAidStatus = async (id, status) => {
    try {
        logger.info(`Updating aid status: ID=${id}, New Status=${status}`);
        
        // For AidDistribution, only support marking as distributed
        if (status.toLowerCase() === 'distributed' || status.toLowerCase() === 'delivered' || status.toLowerCase() === 'verified') {
            logger.info('Marking aid as distributed in AidDistribution contract');
            return executeTransaction('AidDistribution', 'distributeAid', id);
        } else {
            // Track intermediate states off-chain
            logger.info(`Tracking status "${status}" off-chain`);
            await storeBlockchainEvent({
                txHash: null,
                type: 'AidStatusUpdated',
                status: 'CONFIRMED',
                data: { id, status, isOffChain: true }
            });
            return { hash: null, status: 'pending' };
        }
    } catch (error) {
        logger.error(`Error updating aid status: ${error.message}`);
        throw error;
    }
};

// Function to query a specific aid record by ID
const queryAidRecord = async (id) => {
    try {
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
    } catch (error) {
        logger.error(`❌ Error fetching aid record [ID: ${id}]: ${error.message}`);
        
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
        logger.info(`Fetching all aid records from contracts`);
        const records = [];
        
        // First check AidDistribution contract
        if (contracts.AidDistribution) {
            try {
                // Get nextId and handle potential "0x" response
                const nextIdValue = await contracts.AidDistribution.nextId();
                const recordCount = nextIdValue === "0x" ? 0 : Number(nextIdValue);
                logger.info(`Found ${recordCount} records in AidDistribution`);
                
                for (let i = 0; i < recordCount; i++) {
                    try {
                        const record = await callViewFunction('AidDistribution', 'getAidRecord', i);
                        if (record) {
                            records.push({
                                id: i,
                                recipient: record.recipient || "",
                                aidType: "Aid Distribution",
                                amount: record.amount ? record.amount.toString() : "0",
                                status: record.distributed ? "Distributed" : "Pending",
                                addedBy: "0x0000000000000000000000000000000000000000",
                                timestamp: record.timestamp ? new Date(Number(record.timestamp) * 1000).toISOString() : new Date().toISOString()
                            });
                        }
                    } catch (recordError) {
                        logger.warn(`Skipping invalid record at index ${i}: ${recordError.message}`);
                        continue;
                    }
                }
            } catch (error) {
                logger.warn(`Error fetching records from AidDistribution: ${error.message}`);
            }
        } else {
            logger.warn('AidDistribution contract not initialized');
        }
        
        // Then check AidContract
        if (contracts.AidContract) {
            try {
                const recordCount = await contracts.AidContract.recordCount();
                logger.info(`Found ${recordCount} records in AidContract`);
                
                for (let i = 1; i <= Number(recordCount); i++) {
                    try {
                        const record = await callViewFunction('AidContract', 'getAidRecord', i);
                        if (record) {
                            records.push({
                                id: i,
                                recipient: record.recipient || "",
                                aidType: "Aid Contract",
                                amount: record.amount ? record.amount.toString() : "0",
                                status: record.status || "Pending",
                                addedBy: record.addedBy || "0x0000000000000000000000000000000000000000",
                                timestamp: record.timestamp ? new Date(Number(record.timestamp) * 1000).toISOString() : new Date().toISOString()
                            });
                        }
                    } catch (recordError) {
                        logger.warn(`Skipping invalid record at index ${i}: ${recordError.message}`);
                        continue;
                    }
                }
            } catch (error) {
                logger.warn(`Error fetching records from AidContract: ${error.message}`);
            }
        } else {
            logger.warn('AidContract not initialized');
        }
        
        logger.info(`Successfully fetched ${records.length} total records`);
        return records;
    } catch (error) {
        logger.error(`Error in getAllAidRecords: ${error.message}`);
        return [];
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
                
                logger.info(`📢 AidDistributed Event: ${JSON.stringify(event)}`);
                // Here you could add code to store the event in your database
            });
            
            contracts.AidDistribution.on("AidDonated", (donor, amount) => {
                const event = {
                    donor,
                    amount: Number(amount),
                    eventType: "AidDonated"
                };
                
                logger.info(`📢 AidDonated Event: ${JSON.stringify(event)}`);
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
                
                logger.info(`📢 DonorUpdated Event: ${JSON.stringify(event)}`);
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
                
                logger.info(`📢 RefugeeStatusUpdated Event: ${JSON.stringify(event)}`);
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
                
                logger.info(`📢 TaskAssigned Event: ${JSON.stringify(event)}`);
                // Here you could add code to store the event in your database
            });
            
            contracts.FieldWorker.on("TaskCompleted", (taskId) => {
                const event = {
                    taskId: Number(taskId),
                    eventType: "TaskCompleted"
                };
                
                logger.info(`📢 TaskCompleted Event: ${JSON.stringify(event)}`);
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
                
                logger.info(`📢 Aid Added Event: ${JSON.stringify(event)}`);
                // Here you could add code to store the event in your database
            });
            
            contracts.AidContract.on("AidUpdated", (id, status) => {
                const event = {
                    id: Number(id),
                    status,
                    eventType: "AidUpdated"
                };
                
                logger.info(`📢 Aid Updated Event: ID=${id}, New Status=${status}`);
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
                
                logger.info(`📢 Aid Distributed Event: ${JSON.stringify(event)}`);
                // Here you could add code to store the event in your database
            });
            
            contracts.AidContract.on("DonationReceived", (donor, name, amount) => {
                const event = {
                    donor,
                    name,
                    amount: Number(amount),
                    eventType: "DonationReceived"
                };
                
                logger.info(`📢 Donation Received Event: ${JSON.stringify(event)}`);
                // Here you could add code to store the event in your database
            });
        }
        
        logger.info("✅ Listening for blockchain events...");
    } catch (error) {
        logger.error(`❌ Error setting up event listeners: ${error.message}`);
        
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
    logger.info("✅ Stopped listening for blockchain events");
};

// Function to verify transaction confirmation
const verifyTransaction = async (txHash) => {
    try {
        await initializeConnection();
        
        // Try to get transaction receipt
        const receipt = await contracts.provider.getTransactionReceipt(txHash);
        if (!receipt) {
            return {
                verified: false,
                status: 'PENDING',
                message: 'Transaction is still pending'
            };
        }

        // If we have a receipt, check its status
        const confirmed = receipt.status === 1;
        const blockNumber = receipt.blockNumber;
        
        // Get current block number to calculate confirmations
        const currentBlock = await contracts.provider.getBlockNumber();
        const confirmations = currentBlock - blockNumber + 1;
        
        return {
            verified: confirmed,
            status: confirmed ? 'CONFIRMED' : 'FAILED',
            confirmations,
            blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            message: confirmed 
                ? `Transaction confirmed with ${confirmations} confirmation(s)` 
                : 'Transaction failed',
            receipt
        };
    } catch (error) {
        logger.error(`Error verifying transaction ${txHash}: ${error.message}`);
        throw error;
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
            providerUrl: rpcUrl
        };
    } catch (error) {
        logger.error(`❌ Blockchain health check failed: ${error.message}`);
        return {
            connected: false,
            error: error.message
        };
    }
};

// Function to handle donation transactions
const processDonation = async (amount, donorName = "") => {
    try {
        // Amount validation and conversion
        let amountInWei;
        try {
            // Always treat input as ETH amount and convert to Wei
            amountInWei = ethers.parseEther(amount.toString());
        } catch (error) {
            throw new Error(`Invalid amount format: ${error.message}`);
        }

        // Contract requires minimum 0.01 ETH (10000000000000000 Wei)
        const minAmount = ethers.parseEther("0.01");
        if (amountInWei < minAmount) {
            throw new Error(`Minimum donation amount is 0.01 ETH`);
        }

        // Execute donation transaction
        logger.info(`Executing donation transaction: amount=${amountInWei.toString()} wei, name=${donorName}`);

        // Use AidDistribution contract instead
        return executeTransaction(
            'AidDistribution',
            'donate',
            {
                value: amountInWei,
                gasLimit: 300000
            }
        );
    } catch (error) {
        logger.error(`Error processing donation: ${error.message}`);
        throw error;
    }
};

// Function to get a contract instance
const getContract = (contractName) => {
    if (!contracts[contractName]) {
        throw new Error(`Contract ${contractName} not found or not initialized`);
    }
    return contracts[contractName];
};

module.exports = { 
    getContract,
    addAidRecord, 
    updateAidStatus,
    queryAidRecord, 
    getAllAidRecords,
    getBlockchainEvents, 
    removeBlockchainEventListeners,
    verifyTransaction,
    checkBlockchainHealth,
    processDonation,
    initializeConnection
};
