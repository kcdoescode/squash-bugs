const express = require('express');
const router = express.Router();
const { getBugs, createBug, updateBug } = require('../controllers/bugController');

// Route to get bugs requires the organization ID in the URL
router.get('/:orgId', getBugs);

// Route to create a new bug
router.post('/', createBug);

// Route to update a bug (like changing its status)
router.put('/:id', updateBug);

module.exports = router;