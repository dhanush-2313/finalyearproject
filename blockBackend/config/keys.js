require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  DB_URI: process.env.DB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  IPFS_ENDPOINT: process.env.IPFS_ENDPOINT || 'https://ipfs.infura.io:5001/api/v0',
  IPFS_PROJECT_ID: process.env.IPFS_PROJECT_ID,
  IPFS_PROJECT_SECRET: process.env.IPFS_PROJECT_SECRET,
  FABRIC_CONNECTION_PROFILE: process.env.FABRIC_CONNECTION_PROFILE,
  WALLET_PATH: process.env.WALLET_PATH,
  CHANNEL_NAME: process.env.CHANNEL_NAME,
  CONTRACT_NAME: process.env.CONTRACT_NAME,
};