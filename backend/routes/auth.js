const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Helper to generate JWT Token
function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'mysecretkey123',
    { expiresIn: '7d' }
  );
}

// @route   POST /api/auth/register
// @desc    Register a new customer account
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, phone, password } = req.body;
    const userEmail = (email || username || '').trim().toLowerCase();
    const userPhone = (phone || '').trim();

    if (!userEmail || !password || (!name && !username)) {
      return res.status(400).json({ msg: 'Please provide full name, email address, and password' });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email: userEmail });
    if (existingUser) {
      return res.status(409).json({ msg: 'An account with this email address already exists. Please login instead.' });
    }

    const userName = name || username;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      name: userName,
      email: userEmail,
      phone: userPhone,
      password: passwordHash
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone
      },
      msg: 'Account registered successfully!'
    });

  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ msg: 'Account with this email or phone already exists' });
    }
    res.status(500).json({ msg: err.message || 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate customer & get token
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const userIdentifier = (email || username || '').trim().toLowerCase();

    if (!userIdentifier || !password) {
      return res.status(400).json({ msg: 'Please enter email and password' });
    }

    // Check for user
    const user = await User.findOne({
      $or: [{ email: userIdentifier }, { phone: userIdentifier }]
    });

    if (!user) {
      return res.status(401).json({ msg: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(400).json({ msg: 'This account uses Phone OTP or Google Auth. Please login using OTP/Google.' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      msg: 'Logged in successfully!'
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error during login' });
  }
});

// @route   POST /api/auth/send-otp
// @desc    Generate & send OTP code to phone number
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const cleanPhone = (phone || '').replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ msg: 'Please enter a valid 10-digit mobile number' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    let user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      user = new User({
        name: `User_${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        email: `${cleanPhone}@aura.local`,
        otp: { code: otpCode, expiresAt }
      });
    } else {
      user.otp = { code: otpCode, expiresAt };
    }

    await user.save();

    console.log(`[PHONE OTP DEMO] Verification code for ${cleanPhone}: ${otpCode}`);

    res.json({
      success: true,
      msg: `OTP sent successfully to +91 ${cleanPhone}`,
      otpCode: otpCode, // Included for easy demo testing
      phone: cleanPhone
    });

  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ msg: 'Error sending OTP to phone' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP code and authenticate user
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanOtp = (otp || '').trim();

    if (!cleanPhone || !cleanOtp) {
      return res.status(400).json({ msg: 'Please enter mobile number and OTP code' });
    }

    const user = await User.findOne({ phone: cleanPhone });

    if (!user || !user.otp || !user.otp.code) {
      return res.status(400).json({ msg: 'No OTP requested for this number. Please click Send OTP.' });
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ msg: 'OTP has expired. Please request a new OTP.' });
    }

    if (user.otp.code !== cleanOtp) {
      return res.status(400).json({ msg: 'Invalid OTP code. Please check and try again.' });
    }

    // Clear OTP & mark verified
    user.otp = { code: '', expiresAt: null };
    user.isPhoneVerified = true;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      msg: 'Phone verified! Logged in successfully.'
    });

  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ msg: 'Server error verifying OTP' });
  }
});

// @route   POST /api/auth/google
// @desc    Direct Google Connect authentication
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;
    const userEmail = (email || '').trim().toLowerCase();

    if (!userEmail) {
      return res.status(400).json({ msg: 'Google login requires a valid email address' });
    }

    let user = await User.findOne({
      $or: [{ email: userEmail }, { googleId: googleId }]
    });

    if (!user) {
      user = new User({
        name: name || userEmail.split('@')[0],
        email: userEmail,
        googleId: googleId || `g_${Date.now()}`,
        isPhoneVerified: false
      });
      await user.save();
    } else if (!user.googleId && googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      msg: 'Connected with Google successfully!'
    });

  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(500).json({ msg: 'Server error during Google authentication' });
  }
});

// @route   POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ msg: 'Logged out successfully' });
});

// @route   GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User account not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Auth /me error:', err);
    res.status(500).json({ msg: 'Server error fetching user profile' });
  }
});

module.exports = router;
