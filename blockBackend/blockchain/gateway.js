const { ethers } = require("ethers");
const path = require('path');
const fs = require('fs');
const monitoring = require('../utils/monitoring');
const logger = require('../utils/logger');
const { rpcUrl } = require('../config/blockchainConfig');
require('dotenv').config();

// Load environment variables
const { ADMIN_PRIVATE_KEY } = process.env;

if (!ADMIN_PRIVATE_KEY) {
    throw new Error('ADMIN_PRIVATE_KEY environment variable is required');
}

// Contracts configuration
const CONTRACTS = {
    AidDistribution: {
        address: "0xE94a8c2f516DFCf1AC911fF950f6FBd1FE4f63d2",
        path: "../../blockchain/artifacts/contracts/AidDistribution.sol/AidDistribution.json"
    },
    DonorTracking: {
        address: "0xf6F39f608B06a16468e997D939846b3DeeB24d1b",
        path: "../../blockchain/artifacts/contracts/DonorTracking.sol/DonorTracking.json"
    },
    RefugeeAccess: {
        address: "0xb7496E0aC913a246A5a2d272B4CC493d1b962971",
        path: "../../blockchain/artifacts/contracts/RefugeeAccess.sol/RefugeeAccess.json"
    },
    FieldWorker: {
        address: "0x5c3F66d2d21993fdA4673757D94AfB82982D07E7",
        path: "../../blockchain/artifacts/contracts/FieldWorker.sol/FieldWorker.json"
    },
    AidContract: {
        // Use the same address as AidDistribution since it's the main contract
        address: "0xE94a8c2f516DFCf1AC911fF950f6FBd1FE4f63d2",
        path: "../../blockchain/artifacts/contracts/AidContract.sol/AidContract.json"
    }
};

// Connect to Ethereum provider
let provider;
let wallet;
let contracts = {};

// Load contract ABIs
const loadContractABIs = async () => {
    try {
        console.log('Starting to load contract ABIs...');
        for (const [name, config] of Object.entries(CONTRACTS)) {
            try {
                console.log(`Loading ABI for ${name} contract...`);
                console.log('ABI path:', config.path);
                
                const abiPath = path.join(__dirname, config.path);
                console.log('Full ABI path:', abiPath);
                
                const artifactContent = fs.readFileSync(abiPath, 'utf8');
                const artifact = JSON.parse(artifactContent);
                config.abi = artifact.abi;
                console.log(`ABI content loaded for ${name}`);
            } catch (error) {
                console.error(`Error loading ABI for ${name}:`, error);
                throw error;
            }
        }
        console.log('All contract ABIs loaded successfully');
    } catch (error) {
        console.error('Error in loadContractABIs:', error);
        throw error;
    }
};

// Initialize connection with retry mechanism
const initializeConnection = async () => {
    try {
        console.log('Starting blockchain connection initialization...');
        console.log('RPC URL:', rpcUrl);
        
        // Initialize provider
        provider = new ethers.JsonRpcProvider(rpcUrl);
        console.log('Provider initialized');
        
        // Initialize wallet with admin private key
        wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
        console.log('Wallet initialized with address:', wallet.address);
        
        // Load contract ABIs
        console.log('Loading contract ABIs...');
        await loadContractABIs();
        console.log('Contract ABIs loaded');
        
        // Initialize contract instances
        console.log('Initializing contract instances...');
        for (const [name, config] of Object.entries(CONTRACTS)) {
            try {
                console.log(`Initializing ${name} contract...`);
                console.log('Contract address:', config.address);
                console.log('Contract ABI:', config.abi);
                
                contracts[name] = new ethers.Contract(
                    config.address,
                    config.abi,
                    wallet
                );
                console.log(`${name} contract initialized successfully`);
            } catch (error) {
                console.error(`Error initializing ${name} contract:`, error);
                throw error;
            }
        }
        
        console.log('All contracts initialized successfully');
        return true;
    } catch (error) {
        console.error('Error in initializeConnection:', error);
        throw error;
    }
};

// Initialize connection when module is loaded
initializeConnection().catch(err => {
    logger.logError(`Initial blockchain connection failed: ${err.message}`);
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
        
        logger.logInfo(`Executing ${contractName}.${methodName} with args:`, args, 'options:', options);

        // Execute the transaction with proper options
        const tx = await contracts[contractName][methodName](...args, options);
        logger.logInfo(`✅ Transaction submitted: Contract=${contractName}, Method=${methodName}, Hash=${tx.hash}`);
        
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
        logger.logError(`❌ Transaction failed: Contract=${contractName}, Method=${methodName}, Error=${error.message}`);
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
const addAidRecord = async (recipient, aidType, amount, paymentMethod = "ETH", paymentDetails = "", options = {}) => {
    try {
        logger.logInfo(`Creating aid record with AidDistribution: description=${aidType}, amount=${amount}, recipient=${recipient}`);
        return executeTransaction(
            'AidDistribution', 
            'createAidRecord',
            aidType, // description
            amount,  // amount 
            recipient, // recipient address
            { 
                ...options, 
                gasLimit: options.gasLimit || 1000000,  // Increased gas limit
                gasPrice: options.gasPrice || undefined
            }
        );
    } catch (error) {
        logger.logError(`Error in addAidRecord: ${error.message}`);
        throw error;
    }
};

// Function to update aid status
const updateAidStatus = async (id, status) => {
    try {
        logger.logInfo(`Updating aid status: ID=${id}, New Status=${status}`);
        
        // For AidDistribution, only support marking as distributed
        if (status.toLowerCase() === 'distributed' || status.toLowerCase() === 'delivered' || status.toLowerCase() === 'verified') {
            logger.logInfo('Marking aid as distributed in AidDistribution contract');
            return executeTransaction('AidDistribution', 'distributeAid', id);
        } else {
            // Track intermediate states off-chain
            logger.logInfo(`Tracking status "${status}" off-chain`);
            await storeBlockchainEvent({
                txHash: null,
                type: 'AidStatusUpdated',
                status: 'CONFIRMED',
                data: { id, status, isOffChain: true }
            });
            return { hash: null, status: 'pending' };
        }
    } catch (error) {
        logger.logError(`Error updating aid status: ${error.message}`);
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
        console.log('Starting getAllAidRecords...');
        const contract = contracts.AidDistribution;
        if (!contract) {
            console.error('AidDistribution contract not found in contracts object');
            throw new Error('Contract AidDistribution not found or not initialized.');
        }
        console.log('Contract found, getting nextId...');
        
        const nextId = await contract.nextId();
        console.log('Next ID:', nextId.toString());
        
        const records = [];
        for (let i = 0; i < nextId; i++) {
            try {
                console.log(`Fetching record ${i}...`);
                const record = await contract.aidRecords(i);
                console.log('Raw record:', record);
                
                records.push({
                    id: i,
                    recipient: record.recipient,
                    aidType: record.description,
                    amount: record.amount.toString(),
                    addedBy: "0x0", // Not available in AidDistribution
                    timestamp: record.timestamp ? record.timestamp.toString() : Math.floor(Date.now() / 1000).toString(),
                    status: record.distributed ? "Distributed" : "Pending"
                });
                console.log('Processed record:', records[records.length - 1]);
            } catch (error) {
                console.error(`Error fetching record ${i}:`, error);
                continue;
            }
        }
        
        console.log('Total records found:', records.length);
        return records;
    } catch (error) {
        console.error('Error in getAllAidRecords:', error);
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
        logger.logError(`Error verifying transaction ${txHash}: ${error.message}`);
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
        logger.logError(`❌ Blockchain health check failed: ${error.message}`);
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
        logger.logInfo(`Executing donation transaction: amount=${amountInWei.toString()} wei, name=${donorName}`);

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
        logger.logError(`Error processing donation: ${error.message}`);
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
