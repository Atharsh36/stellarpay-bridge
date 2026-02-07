const express = require('express');
const { getWalletBalance } = require('../services/stellarWalletService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/wallet/me - Get current user's wallet info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.stellarPublicKey) {
      return res.status(400).json({ error: 'No wallet found for user' });
    }
    
    console.log(`📊 Fetching wallet data for user: ${user.email}`);
    
    // Get live balance from Stellar network
    const balance = await getWalletBalance(user.stellarPublicKey);
    
    res.json({
      publicKey: user.stellarPublicKey,
      balance: balance
    });
  } catch (error) {
    console.error('❌ Wallet fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet data' });
  }
});

// GET /api/wallet/balance - Get balance for any public key (for compatibility)
router.get('/balance', async (req, res) => {
  try {
    const { publicKey } = req.query;
    
    if (!publicKey) {
      return res.status(400).json({ error: 'Public key required' });
    }
    
    const balance = await getWalletBalance(publicKey);
    res.json({ balance: parseFloat(balance) });
  } catch (error) {
    console.error('❌ Balance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

module.exports = router;