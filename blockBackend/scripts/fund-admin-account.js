const { ethers } = require("ethers");
require('dotenv').config();
const logger = require('../utils/logger');

async function fundAdminAccount() {
  try {
    // Connect to the blockchain
    const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    
    // Get default Ganache accounts (they come with 100 ETH each)
    const accounts = await provider.listAccounts();
    const funderWallet = new ethers.Wallet(
      // This is the default private key for the first Ganache account
      // Only use this in development!
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", 
      provider
    );
    
    // Get admin wallet from your env variable
    const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    const adminAddress = await adminWallet.getAddress();
    
    // Check admin balance
    const adminBalance = await provider.getBalance(adminAddress);
    console.log(`Admin account balance: ${ethers.formatEther(adminBalance)} ETH`);
    
    // If balance is less than 10 ETH, send 50 ETH
    if (adminBalance < ethers.parseEther("10")) {
      console.log(`Admin account balance low. Transferring 50 ETH to ${adminAddress}...`);
      
      // Send transaction
      const tx = await funderWallet.sendTransaction({
        to: adminAddress,
        value: ethers.parseEther("50")
      });
      
      console.log(`Transaction sent! Hash: ${tx.hash}`);
      console.log('Waiting for confirmation...');
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Check new balance
      const newBalance = await provider.getBalance(adminAddress);
      console.log(`Transaction confirmed!`);
      console.log(`New admin balance: ${ethers.formatEther(newBalance)} ETH`);
    } else {
      console.log('Admin account has sufficient funds.');
    }
  } catch (error) {
    console.error('Error funding admin account:', error);
  }
}

// Run the function
fundAdminAccount();