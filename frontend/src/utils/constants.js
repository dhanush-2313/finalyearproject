// API Base URL - Use environment variable or default to localhost
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Blockchain network information
export const BLOCKCHAIN_NETWORKS = {
  development: {
    name: 'Development',
    chainId: '0x539', // 1337 in hex
    rpcUrl: 'http://localhost:8545',
    blockExplorer: '',
  },
  goerli: {
    name: 'Goerli Testnet',
    chainId: '0x5',
    rpcUrl: 'https://goerli.infura.io/v3/your-infura-id',
    blockExplorer: 'https://goerli.etherscan.io',
  },
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: '0xaa36a7',
    rpcUrl: 'https://sepolia.infura.io/v3/your-infura-id',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  DONOR: 'donor',
  FIELD_WORKER: 'fieldWorker',
  REFUGEE: 'refugee',
};

// Aid status options
export const AID_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
};

// Aid types
export const AID_TYPES = [
  'Food',
  'Water',
  'Medical Supplies',
  'Shelter',
  'Clothing',
  'Education',
  'Financial',
  'Other',
];

// File upload size limit in bytes (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Accepted file types for upload
export const ACCEPTED_FILE_TYPES = '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt';

// Default pagination settings
export const DEFAULT_PAGE_SIZE = 10;

// IPFS Gateway URL for resolving CIDs
export const IPFS_GATEWAY_URL = 'https://gateway.ipfs.io/ipfs/'; 