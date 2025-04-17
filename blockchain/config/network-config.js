module.exports = {
    development: {
      networkName: "Hardhat Local Network",
      rpcUrl: "http://localhost:8545",
      chainId: 1337,
    },
    ropsten: {
      networkName: "Ropsten Testnet",
      rpcUrl: "https://ropsten.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      chainId: 3,
    },
    mainnet: {
      networkName: "Ethereum Mainnet",
      rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      chainId: 1,
    },
  };
  