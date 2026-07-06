const express = require('express');
const router = express.Router();
const { signup } = require('../controllers/authController');

// Route incoming POST traffic at /signup to our controller function
router.post('/signup', signup);

// (We will add the login route here later!)

module.exports = router;