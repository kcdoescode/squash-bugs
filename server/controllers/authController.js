const User = require('../models/User');
const Organization = require('../models/Organization');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

const signup = async (req, res) => {
  try {
    const { name, email, password, organizationName, inviteCode, mode } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let orgId = null;
    let role = 'Member';

    // 3. Handle Organization Logic based on 'mode' ('create' or 'join')
    if (mode === 'create') {
      // Create a new organization and generate an invite code
      const newInviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      const newOrg = await Organization.create({
        name: organizationName,
        inviteCode: newInviteCode
      });
      orgId = newOrg._id;
      role = 'Admin';
    } else if (mode === 'join') {
      // Find the organization by invite code
      const existingOrg = await Organization.findOne({ inviteCode });
      if (!existingOrg) {
        return res.status(404).json({ message: 'Invalid invite code' });
      }
      orgId = existingOrg._id;
    } else {
       return res.status(400).json({ message: 'Invalid signup mode' });
    }

    // 4. Create the User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      organizationId: orgId,
      role
    });

    // 5. If they created the org, set them as the admin now that they exist
    if (mode === 'create') {
        await Organization.findByIdAndUpdate(orgId, { admin: user._id });
    }

    const org = await Organization.findById(orgId);

    // 6. Send Response
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      organizationId: user.organizationId,
      organizationName: org.name,
      inviteCode: org.inviteCode,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Add login function if you haven't already
const login = async (req, res) => {
    // ... existing login logic, ensure it returns user.organizationId
     try {
        const { email, password } = req.body;
        // Populate pulls in the full organization object so we can read its name and inviteCode!
        const user = await User.findOne({ email }).populate('organizationId');
        
        if (user && (await bcrypt.compare(password, user.password))) {
             res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                organizationId: user.organizationId ? user.organizationId._id : null,
                organizationName: user.organizationId ? user.organizationId.name : null,
                inviteCode: user.organizationId ? user.organizationId.inviteCode : null,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
             res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch(err) {
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = { signup, login };