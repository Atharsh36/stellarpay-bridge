const express = require('express');
const { getAccountBalance } = require('../utils/stellar');
const authRoutes = require('./auth');

const router = express.Router();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = authRoutes.getUsers();
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { getWalletBalance } = require('../services/stellarWalletService');
    const balance = await getWalletBalance(user.stellarPublicKey);
    
    res.json({
      publicKey: user.stellarPublicKey,
      balance: balance,
      funded: user.funded || false
    });
  } catch (error) {
    console.error('📊 Wallet fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet data' });
  }
});

router.get('/balance', async (req, res) => {
  try {
    const { publicKey } = req.query;
    if (!publicKey) {
      return res.status(400).json({ error: 'Public key required' });
    }
    
    const { getAccountBalance } = require('../utils/stellar');
    const balance = await getAccountBalance(publicKey);
    res.json({ balance });
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

module.exports = router;