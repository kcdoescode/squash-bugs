const Bug = require('../models/Bug');
const { analyzeBugAndGenerateTags, suggestBugFix } = require('../utils/aiService');

const getBugs = async (req, res) => {
  try {
    const { orgId } = req.params;
    const bugs = await Bug.find({ organizationId: orgId }).sort({ createdAt: -1 });
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

    res.status(201).json(bug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBug = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedBug = await Bug.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true } 
    );

    if (!updatedBug) {
        return res.status(404).json({ message: 'Bug not found' });
    }

    res.json(updatedBug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- NEW FUNCTION ADDED HERE ---
const analyzeBug = async (req, res) => {
    try {
      const { title, description } = req.body;
      // Call the AI Service
      const solution = await suggestBugFix(title, description);
      res.json({ solution });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

module.exports = { getBugs, createBug, updateBug, analyzeBug };