const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, clickPattern, email } = req.body;
    
    if (!username || !clickPattern) {
      return res.status(400).json({ 
        error: 'Username and click pattern are required' 
      });
    }
    
    const validPattern = /^(L|R|DL|DR|LL)(-L|-R|-DL|-DR|-LL)*$/;
    if (!validPattern.test(clickPattern)) {
      return res.status(400).json({ 
        error: 'Invalid click pattern format. Use L, R, DL, DR, LL separated by hyphens (e.g., L-R-DL-LL)' 
      });
    }
    
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Username already exists' 
      });
    }
    
    const user = new User({
      username: username.toLowerCase(),
      clickPattern,
      email
    });
    
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'nosightinbox-secret-key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed. Please try again.' 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, clickPattern } = req.body;
    
    if (!username || !clickPattern) {
      return res.status(400).json({ 
        error: 'Username and click pattern are required' 
      });
    }
    
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid username or click pattern' 
      });
    }
    
    const isMatch = await user.compareClickPattern(clickPattern);
    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Invalid username or click pattern' 
      });
    }
    
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'nosightinbox-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed. Please try again.' 
    });
  }
});

module.exports = router;
