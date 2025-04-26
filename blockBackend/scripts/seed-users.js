require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    
    try {
      // Check if admin user exists
      let adminUser = await User.findOne({ role: 'admin' });
      
      if (!adminUser) {
        // Create admin user
        const adminPassword = 'admin123'; // Change this to a secure password in production
        
        adminUser = new User({
          name: 'Admin User',
          email: 'admin@example.com',
          password: adminPassword, // Will be hashed by pre-save middleware
          role: 'admin'
        });
        
        await adminUser.save();
        console.log('✅ Created admin user:');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
      } else {
        console.log('ℹ️ Admin user already exists');
      }
      
      // Check if donor user exists
      let donorUser = await User.findOne({ role: 'donor' });
      
      if (!donorUser) {
        // Create donor user
        const donorPassword = 'donor123'; // Change this to a secure password in production
        
        donorUser = new User({
          name: 'Donor User',
          email: 'donor@example.com',
          password: donorPassword, // Will be hashed by pre-save middleware
          role: 'donor'
        });
        
        await donorUser.save();
        console.log('✅ Created donor user:');
        console.log('Email: donor@example.com');
        console.log('Password: donor123');
      } else {
        console.log('ℹ️ Donor user already exists');
      }
      
      // Check if field worker user exists
      let fieldWorkerUser = await User.findOne({ role: 'fieldWorker' });
      
      if (!fieldWorkerUser) {
        // Create field worker user
        const fieldWorkerPassword = 'field123'; // Change this to a secure password in production
        
        fieldWorkerUser = new User({
          name: 'Field Worker User',
          email: 'field@example.com',
          password: fieldWorkerPassword, // Will be hashed by pre-save middleware
          role: 'fieldWorker'
        });
        
        await fieldWorkerUser.save();
        console.log('✅ Created field worker user:');
        console.log('Email: field@example.com');
        console.log('Password: field123');
      } else {
        console.log('ℹ️ Field worker user already exists');
      }
      
      // Check if refugee user exists
      let refugeeUser = await User.findOne({ role: 'refugee' });
      
      if (!refugeeUser) {
        // Create refugee user
        const refugeePassword = 'refugee123'; // Change this to a secure password in production
        
        refugeeUser = new User({
          name: 'Refugee User',
          email: 'refugee@example.com',
          password: refugeePassword, // Will be hashed by pre-save middleware
          role: 'refugee'
        });
        
        await refugeeUser.save();
        console.log('✅ Created refugee user:');
        console.log('Email: refugee@example.com');
        console.log('Password: refugee123');
      } else {
        console.log('ℹ️ Refugee user already exists');
      }
      
      console.log('✅ User seeding completed');
    } catch (error) {
      console.error('❌ Error seeding users:', error);
    } finally {
      // Close database connection
      mongoose.connection.close(() => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });