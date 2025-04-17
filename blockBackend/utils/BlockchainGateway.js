const Web3 = require('web3');
const { contractABI, contractAddress } = require('../config/blockchainConfig'); // ✅ Correct import
require('dotenv').config();

console.log("✅ Loaded contract ABI:", contractABI);  // Debugging step

// Initialize Web3 instance
const web3 = new Web3(process.env.BLOCKCHAIN_RPC_URL);

// ✅ Correct ABI validation
if (!contractABI || contractABI.length === 0) {
  console.error("❌ ABI is missing. Ensure contract compilation was successful.");
  process.exit(1);
}

// ✅ Corrected contract initialization
const aidContract = new web3.eth.Contract(contractABI, contractAddress);

console.log("✅ Smart contract initialized successfully!");
console.log("🔍 Blockchain RPC URL:", process.env.BLOCKCHAIN_RPC_URL);
console.log("🔍 Contract Address:", contractAddress);
console.log("🔍 ABI Loaded:", contractABI.length > 0 ? "✅ ABI exists" : "❌ ABI is empty!");



/**
 * Add a new aid record (Only Admin)
 */
exports.addAidRecord = async (recipient, aidType, amount, privateKey) => {
  try {
    const adminAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
    const tx = aidContract.methods.addAidRecord(recipient, aidType, amount);

    const gas = await tx.estimateGas({ from: adminAccount.address });
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(adminAccount.address);

    const signedTx = await adminAccount.signTransaction({
      to: contractAddress,
      data,
      gas,
      gasPrice,
      nonce,
    });

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`✅ Aid record added: Transaction Hash - ${receipt.transactionHash}`);
    return { success: true, transactionHash: receipt.transactionHash };
  } catch (error) {
    console.error('❌ Blockchain transaction failed:', error);
    throw new Error('Blockchain transaction failed');
  }
};

/**
 * Update aid status (Only Admin)
 */
exports.updateAidStatus = async (id, status, privateKey) => {
  try {
    const adminAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
    const tx = aidContract.methods.updateAidStatus(id, status);

    const gas = await tx.estimateGas({ from: adminAccount.address });
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(adminAccount.address);

    const signedTx = await adminAccount.signTransaction({
      to: contractAddress,
      data,
      gas,
      gasPrice,
      nonce,
    });

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`✅ Aid status updated: Transaction Hash - ${receipt.transactionHash}`);
    return { success: true, transactionHash: receipt.transactionHash };
  } catch (error) {
    console.error('❌ Error updating aid status:', error);
    throw new Error('Failed to update aid status');
  }
};

/**
 * Get aid record by ID
 */
exports.getAidRecord = async (id) => {
  try {
    const record = await aidContract.methods.getAidRecord(id).call();
    console.log(`📄 Aid Record [ID: ${id}]:`, record);
    return record;
  } catch (error) {
    console.error(`❌ Error querying aid record [ID: ${id}]:`, error);
    throw new Error('Failed to query aid record');
  }
};

/**
 * Get latest blockchain block number
 */
exports.getLatestBlock = async () => {
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    console.log("📌 Latest Block Number:", blockNumber);
    return blockNumber;
  } catch (error) {
    console.error('❌ Error fetching latest block:', error);
    throw new Error('Failed to fetch latest block');
  }
};

/**
 * Get blockchain events
 */
exports.getBlockchainEvents = async () => {
  try {
    const events = await aidContract.getPastEvents('allEvents', { fromBlock: 0, toBlock: 'latest' });
    console.log("📡 Retrieved Blockchain Events:", events.length);
    return events;
  } catch (error) {
    console.error('❌ Error fetching blockchain events:', error);
    throw new Error('Failed to fetch events');
  }
};
