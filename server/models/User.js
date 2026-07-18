const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // These two lines are the key to multi-tenancy!
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  role: { type: String, enum: ['Admin', 'Member'], default: 'Member' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);