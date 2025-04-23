# AidForge Backend API

This directory contains the Node.js/Express backend API for the AidForge platform, which handles user authentication, blockchain interaction, IPFS storage, and database operations.

## Features

- User authentication with JWT
- Role-based access control (Admin, Donor, Field Worker, Refugee)
- Blockchain integration with Ethereum smart contracts
- IPFS document storage and retrieval
- MongoDB database integration
- Prometheus monitoring metrics

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or remote instance)
- IPFS daemon (local or remote)
- Access to an Ethereum node (local Ganache or testnet)

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/aidforge
JWT_SECRET=your_jwt_secret_key
PROVIDER_URL=http://localhost:8545
CONTRACT_ADDRESS=your_deployed_contract_address
ADMIN_PRIVATE_KEY=your_admin_wallet_private_key
IPFS_ENDPOINT=http://localhost:5001/api/v0
LOG_LEVEL=combined
```

## Running the Server

Development mode with hot reloading:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/current-user` - Get current user info

### Blockchain Integration

- `GET /api/blockchain/events` - Get blockchain events
- `POST /api/blockchain/aid` - Add a new aid record to blockchain
- `GET /api/blockchain/aid/:id` - Get an aid record from blockchain
- `PATCH /api/blockchain/aid/:id` - Update aid status on blockchain

### IPFS Integration

- `POST /api/ipfs/upload` - Upload a file to IPFS
- `GET /api/ipfs/file/:cid` - Get a file from IPFS
- `GET /api/ipfs/files` - List IPFS files
- `PATCH /api/ipfs/files/:fileId/verify` - Verify a file

### User Management

- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/refugees` - Get all refugees
- `GET /api/donors` - Get all donors

### Monitoring

- `GET /api/monitoring/metrics` - Get Prometheus metrics
- `GET /api/monitoring/health` - Health check endpoint
- `GET /api/monitoring/info` - System information

## Database Models

- `User` - User accounts and authentication
- `AidRecords` - Aid distribution records
- `Refugee` - Refugee information
- `Donations` - Donation records
- `ActivityLog` - System activity logs
- `BlockchainEvent` - Blockchain event records
- `IPFSFile` - IPFS file metadata

## Testing

Run tests with:

```bash
npm test
```

## Folder Structure

```
blockBackend/
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── models/          # MongoDB schemas
├── routes/          # API routes
├── utils/           # Utility functions
├── blockchain/      # Blockchain integration
├── config/          # Configuration files
├── tests/           # Test files
└── server.js        # Entry point
```

## Blockchain Integration

The backend connects to Ethereum via the `blockchain/gateway.js` module, which uses ethers.js to interact with the deployed smart contracts.

## IPFS Integration

File storage is handled via the IPFS protocol, with the `utils/ipfs.js` module providing upload and retrieval functions
