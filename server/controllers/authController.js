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

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by their email
    const user = await User.findOne({ email });

    // 2. If user exists AND the password matches the scrambled password in the database
    if (user && (await bcrypt.compare(password, user.password))) {
      // 3. Send back the VIP Pass!
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        organizationId: user.organization,
        token: generateToken(user._id, user.organization),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { signup, login };