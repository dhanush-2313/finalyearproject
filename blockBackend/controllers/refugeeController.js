const Refugee = require('../models/Refugee');
const AidRecord = require('../models/AidRecords');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const profile = await Refugee.findById(req.user.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

exports.viewAidReceived = async (req, res) => {
  try {
    // Get the user's wallet address
    const user = await User.findById(req.user.id);
    if (!user || !user.walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'User wallet address not found' 
      });
    }

    // Find aid records for the user's wallet address
    const aidRecords = await AidRecord.find({ 
      recipientAddress: user.walletAddress.toLowerCase() 
    }).populate('fieldWorker', 'name email');

    res.status(200).json({
      success: true,
      count: aidRecords.length,
      records: aidRecords
    });
  } catch (error) {
    console.error('Error fetching aid records:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching aid records' 
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Data is required' });
    }
    const updatedProfile = await Refugee.findByIdAndUpdate(req.user.id, req.body, { new: true });
    res.json(updatedProfile);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error updating profile' });
  }
};
