const Bug = require('../models/Bug');
const { analyzeBugAndGenerateTags } = require('../utils/aiService');

// @desc    Get all bugs for a specific organization
// @route   GET /api/bugs/:orgId
const getBugs = async (req, res) => {
  try {
    const { orgId } = req.params;
    // Find all bugs that belong to this organization, sorted by newest first
    const bugs = await Bug.find({ organizationId: orgId }).sort({ createdAt: -1 });
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new bug
// @route   POST /api/bugs
const createBug = async (req, res) => {
  try {
    const { title, description, priority, organizationId, createdBy } = req.body;

    // Call our AI Service to read the description and generate tags!
    const tags = await analyzeBugAndGenerateTags(title, description);

    const bug = await Bug.create({
      title,
      description,
      priority,
      tags, // Save the generated tags to the database
      organizationId,
      createdBy
    });

    res.status(201).json(bug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a bug
// @route   PUT /api/bugs/:id
const updateBug = async (req, res) => {
  try {
    const { id } = req.params;
    
    // We can accept updates for status, priority, description, etc.
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

module.exports = { getBugs, createBug, updateBug };