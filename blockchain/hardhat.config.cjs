require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();  // ✅ Load environment variables

module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: process.env.BLOCKCHAIN_RPC_URL,  // ✅ Uses `.env` variable
      accounts: [process.env.PRIVATE_KEY]  // ✅ Secure way to use private key
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



