const { ethers } = require("ethers");
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Load environment variables
const { PROVIDER_URL, CONTRACT_ADDRESS, ADMIN_PRIVATE_KEY } = process.env;

// Load contract ABI
const contractPath = path.resolve(__dirname, '../../blockchain/artifacts/contracts/AidContract.sol/AidContract.json');
const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const contractABI = contractJson.abi;

// Connect to Ethereum provider
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

console.log('✅ Connected to Ethereum Blockchain');

// Function to add an aid record
const addAidRecord = async (recipient, aidType, amount) => {
    try {
        const tx = await contract.addAidRecord(recipient, aidType, amount);
        await tx.wait(); // Wait for the transaction to be mined
        console.log("✅ Aid record added:", tx.hash);
        return tx.hash;
    } catch (error) {
        console.error("❌ Error adding aid record:", error);
        throw error;
    }
};

// Function to query a specific aid record by ID
const queryAidRecord = async (id) => {
    try {
        const record = await contract.getAidRecord(id);
        console.log(`📄 Aid Record [ID: ${id}]:`, record);
        return {
            recipient: record.recipient,
            aidType: record.aidType,
            amount: Number(record.amount), // Convert BigNumber to number
            status: record.status,
            addedBy: record.addedBy
        };
    } catch (error) {
        console.error(`❌ Error fetching aid record [ID: ${id}]:`, error);
        throw error;
    }
};

// Function to listen for AidAdded and AidUpdated events
const getBlockchainEvents = async () => {
    try {
        contract.on("AidAdded", (id, recipient, aidType, amount, status, addedBy) => {
            console.log(`📢 Aid Added Event: ID=${id}, Recipient=${recipient}, Type=${aidType}, Amount=${amount}, Status=${status}, AddedBy=${addedBy}`);
        });

        contract.on("AidUpdated", (id, status) => {
            console.log(`📢 Aid Updated Event: ID=${id}, New Status=${status}`);
        });

        console.log("✅ Listening for blockchain events...");
    } catch (error) {
        console.error("❌ Error setting up event listeners:", error);
        throw error;
    }
};

const removeBlockchainEventListeners = () => {
    contract.removeAllListeners("AidAdded");
    contract.removeAllListeners("AidUpdated");
    console.log("✅ Stopped listening for blockchain events");
};

module.exports = { addAidRecord, queryAidRecord, getBlockchainEvents, removeBlockchainEventListeners };
// Export functions to interact with the contract
module.exports = { addAidRecord, queryAidRecord, getBlockchainEvents };
