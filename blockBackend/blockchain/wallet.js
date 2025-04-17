const { Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const { WALLET_PATH } = require('../config/keys');
const logger = require('../utils/logger');

const createWallet = async () => {
  if (!WALLET_PATH) {
    logger.logError('WALLET_PATH environment variable is missing');
    throw new Error('WALLET_PATH environment variable is missing');
  }
  try {
    const wallet = await Wallets.newFileSystemWallet(WALLET_PATH);
    logger.logInfo('Wallet created successfully');
    return wallet;
  } catch (error) {
    logger.logError('Error creating wallet:', error);
    throw new Error('Failed to create wallet');
  }
};
const addIdentityToWallet = async (wallet, identityName, certificatePath, privateKeyPath) => {
  try {
    const identity = {
      credentials: {
        certificate: fs.readFileSync(certificatePath, 'utf-8'),
        privateKey: fs.readFileSync(privateKeyPath, 'utf-8'),
      },
      mspId: 'Org1MSP', // Fabric organization's MSP ID
      type: 'X.509',
    };
    await wallet.put(identityName, identity);
    logger.logInfo(`Identity ${identityName} added to the wallet successfully`);
  } catch (error) {
    logger.logError('Error adding identity to wallet:', error);
    throw new Error('Failed to add identity to wallet');
  }
};

const getIdentityFromWallet = async (wallet, identityName) => {
  try {
    const identity = await wallet.get(identityName);
    if (!identity) {
      logger.logError(`Identity ${identityName} not found in the wallet`);
      throw new Error('Identity not found');
    }
    return identity;
  } catch (error) {
    logger.logError('Error retrieving identity from wallet:', error);
    throw new Error('Failed to retrieve identity from wallet');
  }
};

module.exports = { createWallet, addIdentityToWallet, getIdentityFromWallet };
