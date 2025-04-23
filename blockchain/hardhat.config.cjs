require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();  // ✅ Load environment variables

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



