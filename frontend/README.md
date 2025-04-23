# AidForge Frontend

This directory contains the React frontend application for the AidForge platform, providing an intuitive user interface for interacting with the humanitarian aid management system.

## Features

- Responsive, modern UI designed with React
- Role-based dashboards for different user types
- Web3 integration with MetaMask for blockchain interactions
- IPFS integration for document management
- Real-time data visualization and aid tracking
- Secure authentication with JWT

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- MetaMask browser extension

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_AID_DISTRIBUTION_CONTRACT=your_deployed_contract_address
```

## Running the Application

Development mode:

```bash
npm start
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## User Roles and Features

### Admin Dashboard

- View all users and their activities
- Approve/reject aid requests
- Verify documents via blockchain
- Monitor system metrics

### Field Worker Interface

- Record aid distribution
- Verify recipient identity
- Upload documentation to IPFS
- Track aid delivery status

### Donor Dashboard

- Make donations
- Track donation usage
- View impact reports
- Access financial transparency data

### Refugee/Recipient Interface

- Register for aid
- Track aid status
- Upload verification documents
- Provide feedback

## Key Components

- **Authentication**: User login/signup with role-based redirects
- **Dashboard**: Custom views for different user roles
- **File Management**: IPFS document upload and verification
- **Blockchain Integration**: Web3 connection to Ethereum network
- **Aid Tracking**: Real-time status updates of aid distribution

## Folder Structure

```
frontend/
├── public/           # Static files
├── src/
│   ├── api/          # API services
│   ├── auth/         # Authentication context
│   ├── components/   # Reusable UI components
│   ├── pages/        # Page components
│   ├── utils/        # Utility functions
│   ├── styles/       # CSS and styling
│   ├── App.js        # Main component
│   └── index.js      # Entry point
└── package.json      # Dependencies
```

## Web3 Integration

The application connects to the Ethereum blockchain through MetaMask, allowing users to:

1. View blockchain data through the AidForge smart contracts
2. Submit transactions for verification and tracking
3. Verify documents and aid distribution on-chain

## IPFS Integration

The IPFS integration allows for:

1. Uploading files directly to IPFS
2. Storing document metadata on the blockchain
3. Retrieving and verifying documents
4. Secure, decentralized file storage

## Responsive Design

The UI is fully responsive and works on:

- Desktop browsers
- Tablets
- Mobile devices

## Browser Compatibility

Tested and compatible with:

- Chrome (recommended for MetaMask integration)
- Firefox
- Safari
- Edge

## MetaMask Integration

To use the blockchain features, users need to:

1. Install the MetaMask extension
2. Connect to the appropriate network (local Ganache or public testnet)
3. Connect their wallet to the application 