const Bug = require('../models/Bug');

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

    const bug = await Bug.create({
      title,
      description,
      priority,
      organizationId,
      createdBy
    });

    res.status(201).json(bug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBugs, createBug };