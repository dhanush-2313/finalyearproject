require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();  // ✅ Load environment variables

// Add custom task for viewing transactions
task("view-tx", "View details of a transaction on the blockchain")
  .addParam("tx", "The transaction hash to view")
  .setAction(async (taskArgs, hre) => {
    const { spawn } = require('child_process');
    const process = spawn('npx', [
      'hardhat',
      'run',
      'scripts/transaction-viewer-fixed.js',
      '--network',
      hre.network.name
    ], {
      env: {
        ...process.env,
        TX_HASH: taskArgs.tx
      },
      stdio: 'inherit'
    });
    
    await new Promise((resolve) => {
      process.on('close', resolve);
    });
  });

module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: process.env.BLOCKCHAIN_RPC_URL,  // ✅ Uses `.env` variable
      accounts: [process.env.PRIVATE_KEY]  // ✅ Secure way to use private key
    },
    localhost: {
      url: "http://127.0.0.1:7545",  // Ganache default URL
      chainId: 1337,  // Corrected Ganache chainId
      // accounts will come from the node itself
    },
    mainnet: {
      url: process.env.MAINNET_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY  // ✅ Enables contract verification
  }
};



