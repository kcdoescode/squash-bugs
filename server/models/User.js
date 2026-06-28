const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // No two users can have the same email
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    // This is the crucial link to the Organization!
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);