const Refugee = require('../models/Refugee');
const AidRecord = require('../models/AidRecords');

exports.getAssignedTasks = async (req, res) => {
  try {
    console.log('Getting assigned tasks for field worker:', req.user.id);
    
    // Find tasks by fieldWorkerId instead of assignedTo
    const tasks = await AidRecord.find({ fieldWorkerId: req.user.id });
    console.log(`Found ${tasks.length} tasks for field worker ${req.user.id}`);
    
    // Return data with a success flag for better API response structure
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, error: 'Error fetching assigned tasks' });
  }
};

exports.updateRefugeeInfo = async (req, res) => {
  try {
    const { id, data } = req.body;
    if (!id || !data) {
      return res.status(400).json({ error: 'ID and data are required' });
    }
    const updatedRefugee = await Refugee.findByIdAndUpdate(id, data, { new: true });
    res.json(updatedRefugee);
  } catch (error) {
    res.status(400).json({ error: 'Error updating refugee info' });
  }
};

exports.submitAidReport = async (req, res) => {
  try {
    // Handle both formats: either with aidDetails wrapper or direct object
    const aidDetails = req.body.aidDetails || req.body;
    
    // Validate that we have some data
    if (!aidDetails || Object.keys(aidDetails).length === 0) {
      return res.status(400).json({ error: 'Aid details are required' });
    }
    
    // Prepare aid record with required fields
    const aidRecord = {
      refugeeId: aidDetails.refugeeId,
      fieldWorkerId: req.user.id, // Use the authenticated user's ID
      description: aidDetails.description,
      dateProvided: aidDetails.dateProvided || new Date(), // Default to current date if not provided
      status: aidDetails.status || 'pending'
    };
    
    // Validate required fields
    if (!aidRecord.refugeeId) {
      return res.status(400).json({ error: 'Refugee ID is required' });
    }
    
    if (!aidRecord.description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    const newAidRecord = await AidRecord.create(aidRecord);
    res.status(201).json(newAidRecord);
  } catch (error) {
    console.error('Error submitting aid report:', error);
    res.status(400).json({ error: 'Error submitting aid report: ' + error.message });
  }
};
