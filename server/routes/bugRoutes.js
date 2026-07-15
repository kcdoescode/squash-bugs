const express = require('express');
const router = express.Router();
const { getBugs, createBug } = require('../controllers/bugController');

// Route to get bugs requires the organization ID in the URL
router.get('/:orgId', getBugs);

// Route to create a new bug
router.post('/', createBug);

module.exports = router;