const Refugee = require('../models/Refugee');
const AidRecord = require('../models/AidRecords');

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
    const aidRecords = await AidRecord.find({ refugeeId: req.user.id });
    res.json(aidRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching aid records' });
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
