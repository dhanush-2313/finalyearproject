# AidForge Blockchain Contracts

This directory contains the Ethereum smart contracts for the AidForge platform. These contracts manage aid distribution, tracking, and verification on the blockchain.

## Contract Overview

- **AidContract.sol**: Main contract for tracking aid distribution
- **AidDistribution.sol**: Handles aid disbursement records
- **DonorTracking.sol**: Tracks donor contributions
- **FieldWorker.sol**: Manages field worker verification activities
- **RefugeeAccess.sol**: Controls refugee identity and aid access

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Hardhat
- MetaMask wallet

## Installation

```bash
npm install
```

## Compiling Contracts

```bash
npx hardhat compile
```

## Running Tests

```bash
npx hardhat test
```

## Local Deployment

Start a local Hardhat node:

```bash
npx hardhat node
```

Deploy contracts to local node:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

## Testnet Deployment

To deploy to a testnet like Sepolia, update the `hardhat.config.cjs` file with your network configuration and private key, then run:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Contract Addresses

After deployment, you'll need to update the contract addresses in:

1. The backend `.env` file (`CONTRACT_ADDRESS` variable)
2. The frontend `.env` file (`REACT_APP_AID_DISTRIBUTION_CONTRACT` variable)

## Contract Verification

To verify contracts on Etherscan, add your Etherscan API key to `hardhat.config.cjs` and run:

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## Contract Interaction

You can interact with deployed contracts using:

1. The `hardhat console`:
   ```bash
   npx hardhat console --network localhost
   ```

2. The provided scripts in the `scripts` directory.

## Custom Network Configuration

To connect to a different network, update the `networks` section in `hardhat.config.cjs`:

```javascript
networks: {
  yournetwork: {
    url: "YOUR_RPC_URL",
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

## Gas Cost Optimization

The contracts are designed with gas optimization in mind. To analyze gas usage, use:

```bash
npx hardhat test --gas-reporter
```
