const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

module.exports = {
  networks: {
    development: {
      provider: () => new HDWalletProvider(process.env.PRIVATE_KEY, "http://localhost:8545"),
      network_id: "*",
    },
    ropsten: {
      provider: () => new HDWalletProvider(process.env.PRIVATE_KEY, process.env.ROPSTEN_URL),
      network_id: 3, 
      gas: 5500000,
    },
    mainnet: {
      provider: () => new HDWalletProvider(process.env.PRIVATE_KEY, process.env.MAINNET_URL),
      network_id: 1, 
      gas: 5500000,
    },
  },
  compilers: {
    solc: {
      version: "0.8.4",
    },
  },
};
