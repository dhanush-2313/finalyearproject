const Donation = require('../models/Donations');
const { getContract, verifyTransaction, processDonation } = require('../blockchain/gateway');
const logger = require('../utils/logger');
const { ethers } = require('ethers');
const { createSimpleTransaction } = require('../utils/ganacheSimulator');
const { generateDonationReceipt } = require('../utils/blockchainUtils');

exports.viewDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching donations' });
  }
};

exports.makeDonation = async (req, res) => {
  try {
    const { amount, cause, message, paymentMethod } = req.body;
    
    if (!amount || !cause) {
      return res.status(400).json({ error: 'Amount and cause are required' });
    }

    // Create donation record first
    const newDonation = await Donation.create({ 
      donorId: req.user.id, 
      amount: ethers.parseEther(amount.toString()).toString(),
      cause,
      message: message || '',
      paymentMethod: paymentMethod || 'crypto',
      status: 'processing'
    });
    
    try {
      logger.logInfo(`Processing blockchain donation for user ${req.user.id}, amount: ${amount} ETH`);
      
      // Process the blockchain donation
      const txResult = await processDonation(amount, req.user.name);
      logger.logInfo(`Transaction submitted: ${txResult.hash}`);
      
      // Update donation with transaction hash
      const updatedDonation = await Donation.findByIdAndUpdate(
        newDonation._id, 
        {
          transactionHash: txResult.hash,
          status: 'pending'
        },
        { new: true }
      );

      // Start monitoring the transaction
      txResult.wait(2) // Wait for 2 confirmations
        .then(async (receipt) => {
          if (receipt.status === 1) {
            await Donation.findByIdAndUpdate(newDonation._id, {
              status: 'completed'
            });
            logger.logInfo(`Donation ${newDonation._id} confirmed on blockchain`);
          } else {
            await Donation.findByIdAndUpdate(newDonation._id, {
              status: 'failed',
              error: 'Transaction reverted'
            });
            logger.logError(`Donation ${newDonation._id} failed on blockchain`);
          }
        })
        .catch(async (error) => {
          await Donation.findByIdAndUpdate(newDonation._id, {
            status: 'failed',
            error: error.message
          });
          logger.logError(`Donation ${newDonation._id} failed: ${error.message}`);
        });
      
      res.status(201).json({
        success: true,
        message: 'Donation submitted successfully',
        donation: updatedDonation,
        blockchainDetails: {
          hash: txResult.hash
        }
      });

    } catch (blockchainError) {
      logger.logError(`Blockchain transaction failed: ${blockchainError.message}`);
      
      // Update donation status to failed
      await Donation.findByIdAndUpdate(newDonation._id, {
        status: 'failed',
        error: blockchainError.message
      });
      
      // Check for specific errors and provide clear messages
      if (blockchainError.message.includes('Minimum donation amount')) {
        return res.status(400).json({ 
          success: false,
          error: blockchainError.message,  // Use the exact error from the contract
          details: 'The smart contract requires a minimum donation of 0.01 ETH'
        });
      }
      
      // Handle other blockchain errors
      if (blockchainError.message.includes('gas') || blockchainError.message.includes('revert')) {
        return res.status(400).json({ 
          success: false,
          error: 'Transaction rejected by the blockchain',
          details: blockchainError.message
        });
      }

      throw blockchainError;
    }
  } catch (error) {
    logger.logError('Error making donation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process donation',
      details: error.message
    });
  }
};

exports.trackDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await Donation.findById(id);
    
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    // Check if donation belongs to requesting user
    if (donation.donorId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this donation' });
    }
    
    // If there's a transaction hash, verify it on the blockchain
    if (donation.transactionHash) {
      try {
        const verificationResult = await verifyTransaction(donation.transactionHash);
        
        return res.json({
          donation,
          blockchain: {
            verified: verificationResult.verified,
            blockNumber: verificationResult.blockNumber,
            timestamp: verificationResult.blockTimestamp,
          }
        });
      } catch (verifyError) {
        logger.logError(`Error verifying transaction: ${verifyError.message}`);
        return res.json({
          donation,
          blockchain: { verified: false, error: verifyError.message }
        });
      }
    }
    
    // If no transaction hash, just return the donation data
    res.json({ donation });
  } catch (error) {
    logger.logError(`Error tracking donation: ${error.message}`);
    res.status(400).json({ error: 'Error tracking donation' });
  }
};

exports.generateDonationReceipt = async (req, res) => {
  try {
    const donationData = {
      donorName: req.user.name,
      donorAddress: req.user.walletAddress,
      amount: req.body.amount,
      cause: req.body.cause,
      transactionHash: req.body.transactionHash
    };

    // Generate receipt JSON
    const receipt = await generateDonationReceipt(donationData);
    
    // Store receipt directly in the donation record
    const updatedDonation = await Donation.findOneAndUpdate(
      { transactionHash: donationData.transactionHash },
      { receipt: receipt },
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      receipt: {
        ...receipt,
        donationId: updatedDonation._id
      }
    });
    
  } catch (error) {
    console.error('Error generating donation receipt:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate donation receipt'
    });
  }
};

exports.getDonationStats = async (req, res) => {
  try {
    // Get total donation amount
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
    
    // Format amounts to 4 decimal places
    res.status(200).json({
      success: true,
      stats: {
        totalDonations: donations.length,
        totalAmount: Number(totalAmount.toString()) / 1e18,
        completedAmount: Number(completedAmount.toString()) / 1e18,
        pendingAmount: Number(pendingAmount.toString()) / 1e18,
        uniqueDonors: uniqueDonors.length
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
