const User = require('../models/User');
const Organization = require('../models/Organization');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate the "VIP Pass"
const generateToken = (userId, organizationId) => {
  return jwt.sign({ userId, organizationId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new company and user
// @route   POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;

    // 1. Check if the user already exists in the database
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Scramble (Hash) the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the Organization first
    const organization = await Organization.create({ 
      name: organizationName 
    });

    // 4. Create the User and link them to the new Organization ID
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      organization: organization._id,
    });

    // 5. Send back the success response with the token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      organizationId: organization._id,
      token: generateToken(user._id, organization._id),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup };