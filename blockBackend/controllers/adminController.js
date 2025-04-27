const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Donation = require('../models/Donations'); // Fix model reference
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const { ethers } = require('ethers');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalFieldWorkers = await User.countDocuments({ role: 'fieldWorker' });
    const totalLogs = await ActivityLog.countDocuments();
    res.json({ totalFieldWorkers, totalLogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching dashboard stats' });
  }
};

exports.createFieldWorker = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const newFieldWorker = await User.create({ name, email, password: hashedPassword, role: 'fieldWorker' });
    res.status(201).json(newFieldWorker);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error creating field worker' });
  }
};

exports.deleteFieldWorker = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    const deletedWorker = await User.findByIdAndDelete(id);
    if (!deletedWorker) return res.status(404).json({ error: 'Field worker not found' });
    res.json({ message: 'Field worker deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error deleting field worker' });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching activity logs' });
  }
};

// New controller functions for Admin dashboard

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const donorCount = await User.countDocuments({ role: 'donor' });
    const fieldWorkerCount = await User.countDocuments({ role: 'fieldWorker' });
    const refugeeCount = await User.countDocuments({ role: 'refugee' });
    const activeUsers = await User.countDocuments({ active: true });
    
    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        adminCount,
        donorCount,
        fieldWorkerCount,
        refugeeCount,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers
      }
    });
  } catch (error) {
    logger.logError(`Error fetching user stats: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user statistics'
    });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -mfaSecret') // Exclude sensitive info
      .sort({ createdAt: -1 });
    
    // Return consistent response structure with users array
    res.status(200).json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    logger.logError(`Error fetching users: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch users'
    });
  }
};

// Get activity logs (alias for getActivityLogs for consistent naming)
exports.getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email role');
    
    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    logger.logError(`Error fetching activity logs: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch activity logs'
    });
  }
};

// Get all donations
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find() // Using corrected model name
      .sort({ createdAt: -1 })
      .populate('donorId', 'name email');
    
    res.status(200).json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    logger.logError(`Error fetching donations: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch donations'
    });
  }
};

// Get donation statistics
exports.getDonationStats = async (req, res) => {
  try {
    const donations = await Donation.find();
    
    let totalAmount = BigInt(0);
    let completedAmount = BigInt(0);
    let pendingAmount = BigInt(0);
    
    // Calculate different statistics
    for (const donation of donations) {
      try {
        // Convert amount to BigInt, handling both string and number inputs
        const amountBN = BigInt(Math.round(parseFloat(donation.amount.toString()) * 1e18));
        totalAmount += amountBN;
        
        if (donation.status === 'completed' || donation.status === 'confirmed') {
          completedAmount += amountBN;
        } else if (donation.status === 'pending' || donation.status === 'processing') {
          pendingAmount += amountBN;
        }
      } catch (err) {
        console.error(`Error processing donation ${donation._id}:`, err);
        continue;
      }
    }
    
    // Get unique donor count
    const uniqueDonors = await Donation.distinct('donorId');
    
    // Get donation count by payment method
    const cryptoDonations = await Donation.countDocuments({ paymentMethod: 'crypto' });
    const creditCardDonations = await Donation.countDocuments({ paymentMethod: 'creditCard' });
    const bankTransferDonations = await Donation.countDocuments({ paymentMethod: 'bankTransfer' });

    // Format amounts to 4 decimal places
    res.status(200).json({
      success: true,
      stats: {
        totalDonations: donations.length,
        totalAmount: Number(totalAmount.toString()) / 1e18,
        completedAmount: Number(completedAmount.toString()) / 1e18,
        pendingAmount: Number(pendingAmount.toString()) / 1e18,
        uniqueDonors: uniqueDonors.length,
        paymentMethods: {
          crypto: cryptoDonations,
          creditCard: creditCardDonations,
          bankTransfer: bankTransferDonations
        }
      }
    });
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch donation statistics'
    });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, walletAddress } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // Create user (password will be hashed by the User model's pre-save middleware)
    const newUser = await User.create({
      name,
      email,
      password,
      role: role || 'donor', // Default role
      walletAddress,
      active: true
    });
    
    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: `Created new ${role || 'donor'} account for ${name}`,
      details: `Email: ${email}`,
      timestamp: Date.now()
    });
    
    res.status(201).json({
      success: true,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        active: newUser.active,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    logger.logError(`Error creating user: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create user'
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, active, password } = req.body;
    
    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (active !== undefined) user.active = active;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
    }
    
    await user.save();
    
    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: `Updated user account for ${user.name}`,
      details: `User ID: ${user._id}`,
      timestamp: Date.now()
    });
    
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: Date.now()
      }
    });
  } catch (error) {
    logger.logError(`Error updating user: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user'
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Don't allow deletion of admin if it's the last one
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete the last admin account'
        });
      }
    }
    
    // Store user info for logging
    const userName = user.name;
    const userEmail = user.email;
    
    // Delete user
    await User.findByIdAndDelete(id);
    
    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: `Deleted user account for ${userName}`,
      details: `Email: ${userEmail}`,
      timestamp: Date.now()
    });
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.logError(`Error deleting user: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete user'
    });
  }
};
