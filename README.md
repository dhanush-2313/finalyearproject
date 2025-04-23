# AidForge - Blockchain-Powered Humanitarian Aid Management Platform

AidForge is a decentralized application (DApp) for secure, transparent, and efficient humanitarian aid management. The platform leverages blockchain technology to ensure accountability and traceability in aid distribution.

## Project Overview

AidForge connects donors, NGOs, field workers, and aid recipients on a single platform with different role-based access levels. The platform uses Ethereum smart contracts to record aid transactions, IPFS for secure document storage, and a modern React frontend for intuitive user interaction.

## Features

- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Smart Contract Integration**: Aid tracking and verification via Ethereum blockchain
- **IPFS Document Storage**: Secure storage of aid-related documents with blockchain verification
- **Role-Based Dashboards**: Custom interfaces for donors, NGOs, field workers, and aid recipients
- **Real-Time Aid Tracking**: Monitor aid from donation to delivery
- **Monitoring Dashboard**: Track system metrics and blockchain activities
- **Blockchain Verification**: Immutable record of all aid transactions

## Tech Stack

- **Frontend**: React.js with hooks, context API, and modern UI components
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Blockchain**: Ethereum smart contracts (Solidity)
- **Storage**: IPFS for decentralized file storage
- **Monitoring**: Prometheus metrics
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
aidforge/
├── frontend/              # React frontend application
├── blockBackend/          # Node.js backend API
└── blockchain/            # Ethereum smart contracts
```

## Prerequisites

Before running the application, ensure you have the following installed:

- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB (local or remote instance)
- Ganache (for local blockchain development)
- MetaMask browser extension
- IPFS daemon (optional, can use public gateway)

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/aidforge.git
cd aidforge
```

### 2. Set up the blockchain contracts

```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat node  # In a separate terminal
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Configure and start the backend

```bash
cd ../blockBackend
npm install
cp .env.example .env  # Edit with your configuration
npm start
```

### 4. Configure and start the frontend

```bash
cd ../frontend
npm install
cp .env.example .env  # Edit with your configuration
npm start
```

### 5. Configure MetaMask

- Connect MetaMask to your local Ganache network (usually http://localhost:8545)
- Import accounts using private keys from your Ganache instance

## Environment Variables

### Backend (.env)

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/aidforge
JWT_SECRET=your_jwt_secret_key
PROVIDER_URL=http://localhost:8545
CONTRACT_ADDRESS=your_deployed_contract_address
ADMIN_PRIVATE_KEY=your_admin_wallet_private_key
IPFS_ENDPOINT=http://localhost:5001/api/v0
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_AID_DISTRIBUTION_CONTRACT=your_deployed_contract_address
```

## Running for Development

1. Start MongoDB
2. Start Ganache blockchain
3. Start IPFS daemon (if using local IPFS)
4. Run the backend: `cd blockBackend && npm run dev`
5. Run the frontend: `cd frontend && npm start`

## Testing

```bash
# Backend tests
cd blockBackend
npm test

# Blockchain tests
cd blockchain
npx hardhat test

# Frontend tests
cd frontend
npm test
```

## Deploying to a Public Testnet

To deploy to a public Ethereum testnet (e.g., Sepolia):

1. Create an account on [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/)
2. Get testnet ETH from a faucet
3. Update the hardhat.config.js file with your testnet configuration
4. Deploy using:
   ```bash
   cd blockchain
   npx hardhat run scripts/deploy.js --network sepolia
   ```
5. Update the contract address in both backend and frontend .env files

## Project Roadmap

- **Phase 1**: Local development and testing ✅
- **Phase 2**: Testnet deployment and beta testing
- **Phase 3**: Security audits and optimizations
- **Phase 4**: Mainnet deployment and production release

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenZeppelin for secure smart contract libraries
- IPFS team for decentralized storage solutions
- Ethereum community for blockchain development resources 