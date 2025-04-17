const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const bcrypt = require('bcrypt');

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
