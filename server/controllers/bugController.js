const Bug = require('../models/Bug');
const { analyzeBugAndGenerateTags, suggestBugFix } = require('../utils/aiService');

const getBugs = async (req, res) => {
  try {
    const { orgId } = req.params;
    // CRITICAL UPDATE: We must populate 'createdBy' to get the user's name on the frontend
    const bugs = await Bug.find({ organizationId: orgId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBug = async (req, res) => {
  try {
    const { title, description, priority, organizationId, createdBy } = req.body;

    const tags = await analyzeBugAndGenerateTags(title, description);

    const bug = await Bug.create({
      title,
      description,
      priority,
      tags, 
      organizationId,
      createdBy
    });

    // Populate the newly created bug before returning it so the UI updates instantly
    const populatedBug = await Bug.findById(bug._id).populate('createdBy', 'name email');

    res.status(201).json(populatedBug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBug = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Allow updating title, description, priority, and status
    const updatedBug = await Bug.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true } 
    ).populate('createdBy', 'name email'); // Populate after update

    if (!updatedBug) {
        return res.status(404).json({ message: 'Bug not found' });
    }

    res.json(updatedBug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const analyzeBug = async (req, res) => {
    try {
      const { title, description } = req.body;
      const solution = await suggestBugFix(title, description);
      res.json({ solution });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

module.exports = { getBugs, createBug, updateBug, analyzeBug };