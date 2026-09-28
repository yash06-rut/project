const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  username: { type: String, default: '', lowercase: true, trim: true },
  email: { type: String, default: '', lowercase: true, trim: true },
  phone: { type: String, default: '', trim: true },
  password: { type: String, default: '' },
  googleId: { type: String, default: '' },
  isPhoneVerified: { type: Boolean, default: false },
  otp: {
    code: { type: String, default: '' },
    expiresAt: { type: Date }
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
