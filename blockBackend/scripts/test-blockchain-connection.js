require('dotenv').config();
const { getContract, checkBlockchainHealth } = require('../blockchain/gateway');
const { storeBlockchainEvent } = require('../utils/blockchainEvents');
const mongoose = require('mongoose');
const User = require('../models/User');
const BlockchainEvent = require('../models/BlockchainEvent');
const logger = require('../utils/logger');

// Initialize MongoDB connection
async function initDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    return false;
  }
}

// Test blockchain connection
async function testBlockchainConnection() {
  try {
    console.log('Testing blockchain connection...');
    const health = await checkBlockchainHealth();
    
    if (health.connected) {
      console.log('✅ Connected to blockchain network');
      console.log(`   Block number: ${health.blockNumber}`);
      console.log(`   Chain ID: ${health.chainId}`);
      console.log('\nContract statuses:');
      
      for (const [contract, status] of Object.entries(health.contracts)) {
        console.log(`   ${contract}: ${status}`);
      }
      
      return true;
    } else {
      console.error(`❌ Failed to connect to blockchain: ${health.error}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Blockchain connection test failed: ${error.message}`);
    return false;
  }
}

// Test contract functions
async function testContracts() {
  try {
    console.log('\nTesting contract functions...');
    
    // Get admin user or create one for testing
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = new User({
        name: 'Test Admin',
        email: 'test@example.com',
        password: 'password',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Created test admin user');
    }

    // Test each available contract
    const contractNames = ['AidDistribution', 'DonorTracking', 'RefugeeAccess', 'FieldWorker'];
    
    for (const name of contractNames) {
      try {
        const contract = getContract(name);
        console.log(`✅ Successfully connected to ${name} contract`);
        
        // Test a simple read function
        if (name === 'AidDistribution') {
          const nextId = await contract.nextId();
          console.log(`   Next ID: ${nextId}`);
        }
      } catch (error) {
        console.error(`❌ Failed to connect to ${name} contract: ${error.message}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Contract function test failed: ${error.message}`);
    return false;
  }
}

// Test event storage
async function testEventStorage() {
  try {
    console.log('\nTesting blockchain event storage...');
    
    // Create a test admin user if needed
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ Admin user not found. Run the testContracts function first.');
      return false;
    }
    
    // Create a test event
    const testEvent = {
      txHash: '0x' + '1'.repeat(64),
      type: 'AidAdded',
      status: 'CONFIRMED',
      data: { 
        id: 1, 
        recipient: 'Test Recipient', 
        aidType: 'Food', 
        amount: 100 
      },
      initiatedBy: admin._id,
      blockNumber: 12345
    };
    
    // Store the event
    const storedEvent = await storeBlockchainEvent(testEvent);
    
    if (storedEvent) {
      console.log('✅ Successfully stored test event');
      
      // Verify the event was stored
      const retrievedEvent = await BlockchainEvent.findOne({ txHash: testEvent.txHash });
      
      if (retrievedEvent) {
        console.log('✅ Successfully retrieved test event from database');
        
        // Clean up - remove the test event
        await BlockchainEvent.deleteOne({ _id: retrievedEvent._id });
        console.log('✅ Successfully cleaned up test event');
        
        return true;
      } else {
        console.error('❌ Failed to retrieve test event from database');
        return false;
      }
    } else {
      console.error('❌ Failed to store test event');
      return false;
    }
  } catch (error) {
    console.error(`❌ Event storage test failed: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  console.log('🧪 Testing Backend-Blockchain Connection\n');
  
  // Initialize MongoDB
  const dbConnected = await initDB();
  if (!dbConnected) {
    console.error('❌ Cannot proceed with tests due to database connection failure');
    process.exit(1);
  }
  
  // Run tests
  const blockchainConnected = await testBlockchainConnection();
  if (!blockchainConnected) {
    console.error('❌ Cannot proceed with contract tests due to blockchain connection failure');
    await mongoose.connection.close();
    process.exit(1);
  }
  
  await testContracts();
  await testEventStorage();
  
  // Clean up
  await mongoose.connection.close();
  console.log('\n✅ Tests completed. MongoDB connection closed.');
}

// Run the main function
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(`❌ An unexpected error occurred: ${error.message}`);
    process.exit(1);
  }); 