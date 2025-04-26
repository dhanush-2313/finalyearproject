// Ganache Simulator - For development purposes only
// Creates real transactions in Ganache without requiring wallet funds
// Do NOT use in production

const { ethers } = require('ethers');
const logger = require('./logger');

// Connect to local Ganache instance
const GANACHE_URL = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:7545';

// Create ethers provider
let provider;
try {
  provider = new ethers.JsonRpcProvider(GANACHE_URL);
} catch (error) {
  logger.logError(`Failed to connect to Ganache at ${GANACHE_URL}: ${error.message}`);
}

/**
 * Simple development transaction creator
 * Creates a direct transaction in Ganache without complex signing
 * @param {Object} options - Transaction options
 * @returns {Promise<Object>} - Transaction details
 */
async function createSimpleTransaction(options = {}) {
  try {
    // Get a random recipient address if not provided
    const toAddress = options.to || ethers.Wallet.createRandom().address;
    
    // Convert amount to wei
    const amount = options.value || '0.01';
    const amountInWei = ethers.parseEther(amount.toString());
    
    // Get transaction data
    const data = options.data || 'Donation Transaction';
    const encodedData = ethers.hexlify(ethers.toUtf8Bytes(data));
    
    // Get accounts from Ganache
    const accounts = await provider.send('eth_accounts', []);
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts available in Ganache');
    }
    
    // Use the first account (usually has 100 ETH in Ganache)
    const fromAddress = accounts[0];
    
    // Check balance
    const balance = await provider.getBalance(fromAddress);
    logger.logInfo(`Using account ${fromAddress} with balance ${ethers.formatEther(balance)} ETH`);
    
    if (balance < amountInWei) {
      throw new Error(`Insufficient funds: ${ethers.formatEther(balance)} ETH available, ${amount} ETH needed`);
    }
    
    // Calculate appropriate gas limit - much higher than the default 21000
    // For transactions with data, we need more gas
    const gasLimit = ethers.toQuantity(100000); // Increased from 21000 to 100000
    
    // Send transaction using low-level RPC call
    const txHash = await provider.send('eth_sendTransaction', [{
      from: fromAddress,
      to: toAddress,
      value: ethers.toQuantity(amountInWei),
      data: encodedData,
      gas: gasLimit
    }]);
    
    logger.logInfo(`Transaction sent with hash: ${txHash}`);
    
    // Wait for transaction receipt
    let receipt = null;
    let attempts = 0;
    
    while (!receipt && attempts < 10) {
      try {
        receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
    }
    
    if (!receipt) {
      throw new Error('Transaction not confirmed after multiple attempts');
    }
    
    return {
      success: true,
      hash: txHash,
      from: fromAddress,
      to: toAddress,
      value: amount,
      blockNumber: parseInt(receipt.blockNumber),
      receipt: receipt
    };
  } catch (error) {
    logger.logError(`Error in createSimpleTransaction: ${error.message}`);
    throw error;
  }
}

module.exports = {
  createSimpleTransaction
};