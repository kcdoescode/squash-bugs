const express = require('express');
const router = express.Router();
// Grab both functions from the controller
const { signup, login } = require('../controllers/authController'); 

// Route incoming traffic to the right functions
router.post('/signup', signup);
router.post('/login', login); // <-- The new login route

module.exports = router;