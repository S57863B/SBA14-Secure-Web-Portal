const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const User = require('../models/User');
const { signToken } = require('../utils/auth');

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({ email, password, displayName });
    const token = signToken(user._id);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user._id);

    res.status(200).json({
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// GET /api/users/auth/github
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

// GET /api/users/auth/github/callback
router.get(
  '/auth/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/api/users/auth/failure' }),
  (req, res) => {
    const token = signToken(req.user._id);
    res.status(200).json({
      message: 'GitHub authentication successful.',
      token,
      user: {
        id: req.user._id,
        email: req.user.email,
        displayName: req.user.displayName,
      },
    });
  }
);

// GET /api/users/auth/failure
router.get('/auth/failure', (req, res) => {
  res.status(401).json({ message: 'GitHub authentication failed or was denied.' });
});

module.exports = router;