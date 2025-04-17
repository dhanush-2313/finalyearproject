// utils/constants.js

// Contract addresses on different networks (example)
const contractAddresses = {
    aidDistribution: {
      development: "0x1234567890abcdef1234567890abcdef12345678", // Development network
      testnet: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef", // Testnet
      mainnet: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef" // Mainnet
    },
    donorTracking: {
      development: "0x234567890abcdef1234567890abcdef123456789",
      testnet: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
      mainnet: "0x234567890abcdef1234567890abcdef123456789"
    },
    refugeeAccess: {
      development: "0x34567890abcdef1234567890abcdef1234567890",
      testnet: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
      mainnet: "0x34567890abcdef1234567890abcdef1234567890"
    },
    fieldWorker: {
      development: "0x4567890abcdef1234567890abcdef12345678901",
      testnet: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
      mainnet: "0x4567890abcdef1234567890abcdef12345678901"
    }
  };
  
  // Network settings (RPC URLs, etc.)
  const networks = {

    development: {
      url: "http://localhost:8545",
      chainId: 1337 // Example: Hardhat local network chain ID
    },
    testnet: {
      url: "https://ropsten.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      chainId: 3 // Example: Ropsten testnet chain ID
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      chainId: 1 // Mainnet chain ID
    }
  };
  
  module.exports = { contractAddresses, networks };
  