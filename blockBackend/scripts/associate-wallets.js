require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../utils/logger');
const { MONGO_URI } = require('../config/keys');

// Example wallet addresses from Ganache (for development only)
// These would normally come from user registration or admin assignment
const SAMPLE_WALLETS = {
  admin: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
  fieldWorker: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
  donor: '0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b',
  refugee1: '0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d',
  refugee2: '0xd03ea8624C8C5987235048901fB614fDcA89b117',
  refugee3: '0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC'
};

async function associateWallets() {
  try {
    // Connect to MongoDB
    await mongoose.connect(CLOUD_MONGO_URI);
    console.log('Connected to MongoDB');

    // Find users by role and update with wallet addresses
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      adminUser.walletAddress = SAMPLE_WALLETS.admin;
      await adminUser.save();
      console.log(`✅ Updated admin user ${adminUser.name} with wallet address ${SAMPLE_WALLETS.admin}`);
    }

    const fieldWorkerUser = await User.findOne({ role: 'fieldWorker' });
    if (fieldWorkerUser) {
      fieldWorkerUser.walletAddress = SAMPLE_WALLETS.fieldWorker;
      await fieldWorkerUser.save();
      console.log(`✅ Updated field worker user ${fieldWorkerUser.name} with wallet address ${SAMPLE_WALLETS.fieldWorker}`);
    }

    const donorUser = await User.findOne({ role: 'donor' });
    if (donorUser) {
      donorUser.walletAddress = SAMPLE_WALLETS.donor;
      await donorUser.save();
      console.log(`✅ Updated donor user ${donorUser.name} with wallet address ${SAMPLE_WALLETS.donor}`);
    }

    // Update up to three refugees with wallet addresses
    const refugees = await User.find({ role: 'refugee' }).limit(3);
    const refugeeWallets = [SAMPLE_WALLETS.refugee1, SAMPLE_WALLETS.refugee2, SAMPLE_WALLETS.refugee3];
    
    for (let i = 0; i < refugees.length; i++) {
      refugees[i].walletAddress = refugeeWallets[i];
      await refugees[i].save();
      console.log(`✅ Updated refugee user ${refugees[i].name} with wallet address ${refugeeWallets[i]}`);
    }

    console.log('✅ Successfully associated wallet addresses with users');
  } catch (error) {
    console.error('❌ Error associating wallets:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
associateWallets();