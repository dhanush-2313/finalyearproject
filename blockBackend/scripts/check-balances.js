const { ethers } = require("ethers");
require('dotenv').config();

async function checkAllBalances() {
  try {
    console.log("Connecting to your blockchain at:", process.env.BLOCKCHAIN_RPC_URL);
    const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    
    // Get network information
    const network = await provider.getNetwork();
    console.log(`Connected to network: Chain ID ${network.chainId}`);
    
    // Get block number
    const blockNumber = await provider.getBlockNumber();
    console.log(`Current block number: ${blockNumber}`);

    // Get all accounts
    const accounts = await provider.listAccounts();
    console.log(`Found ${accounts.length} accounts:`);

    // Display all account balances
    for (let i = 0; i < accounts.length; i++) {
      const balance = await provider.getBalance(accounts[i]);
      console.log(`Account ${i}: ${accounts[i]}`);
      console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
      console.log('-'.repeat(50));
    }
    
    // If ADMIN_PRIVATE_KEY is set, check that account too 
    if (process.env.ADMIN_PRIVATE_KEY) {
      try {
        const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
        const adminAddress = await adminWallet.getAddress();
        const adminBalance = await provider.getBalance(adminAddress);
        
        console.log(`Admin account: ${adminAddress}`);
        console.log(`Admin balance: ${ethers.formatEther(adminBalance)} ETH`);
        
        if (adminBalance < ethers.parseEther("0.1")) {
          console.log("\n⚠️ WARNING: Admin account has very low balance!");
          console.log("This is likely causing your 'insufficient funds' error.");
          console.log("\nTo fix this issue:");
          console.log("1. Start your Ganache application");
          console.log("2. Copy one of the accounts with balance from above");
          console.log("3. Update your .env file with the private key for that account");
          console.log("   ADMIN_PRIVATE_KEY=<private_key_of_funded_account>");
        }
      } catch (error) {
        console.error("Error checking admin account:", error.message);
      }
    } else {
      console.log("\n⚠️ WARNING: ADMIN_PRIVATE_KEY is not set in your .env file!");
    }
  } catch (error) {
    console.error("Error connecting to blockchain:", error);
    console.log("\nMake sure your Ganache instance is running and accessible at:", process.env.BLOCKCHAIN_RPC_URL);
  }
}

checkAllBalances();