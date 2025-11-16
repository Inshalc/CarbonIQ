const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { validateLogin, validateRegistration } = require('../middleware/validation');

const router = express.Router();

// User registration
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { username, password, first_name, last_name } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM User WHERE username = ?',
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO User (first_name, last_name, username, password) VALUES (?, ?, ?, ?)',
      [first_name, last_name, username, hashedPassword]
    );
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertId 
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const [users] = await pool.execute(
      'SELECT * FROM User WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Set session
    req.session.userId = user.user_id;
    req.session.username = user.username;
    req.session.firstName = user.first_name;
    req.session.lastName = user.last_name;
    
    res.json({ 
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});

// Check auth status
router.get('/status', (req, res) => {
  if (req.session.userId) {
    res.json({ 
      authenticated: true,
      user: {
        user_id: req.session.userId,
        username: req.session.username,
        first_name: req.session.firstName,
        last_name: req.session.lastName
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;