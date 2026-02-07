const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateWallet } = require('../services/stellarWalletService');
const { encrypt } = require('../utils/encryption');

const router = express.Router();

// In-memory storage for demo
let users = [];

// Create default test users
const createDefaultUsers = async () => {
  if (users.length === 0) {
    const testUsers = [
      { email: 'user@test.com', password: 'password', role: 'USER', id: 'user-1' },
      { email: 'merchant@test.com', password: 'password', role: 'MERCHANT', id: 'merchant-1' },
      { email: 'merchant@gmail.com', password: 'password', role: 'MERCHANT', id: 'merchant-2' }
    ];
    
    for (const testUser of testUsers) {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const { generateWallet } = require('../services/stellarWalletService');
      const wallet = await generateWallet();
      const { encrypt } = require('../utils/encryption');
      
      users.push({
        id: testUser.id, // Use fixed IDs for consistency
        email: testUser.email,
        passwordHash: hashedPassword,
        role: testUser.role,
        stellarPublicKey: wallet.publicKey,
        stellarSecretKeyEncrypted: encrypt(wallet.secretKey),
        funded: wallet.funded,
        initialBalance: wallet.initialBalance,
        isVerified: false,
        isBanned: false,
        suspiciousActivityCount: 0,
        createdAt: new Date()
      });
    }
    console.log('✅ Default test users created: user@test.com, merchant@test.com, merchant@gmail.com (password: password)');
  }
};

// Initialize default users
createDefaultUsers().catch(console.error);

router.post('/signup', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log(`🚀 Creating real Stellar wallet for ${email}...`);
    
    // Step 1: Generate real Stellar wallet
    const wallet = await generateWallet();
    
    // Step 2: Encrypt secret key
    const stellarSecretKeyEncrypted = encrypt(wallet.secretKey);
    
    // Step 3: Save to database
    const user = {
      id: Date.now().toString(),
      email,
      passwordHash: hashedPassword,
      role,
      stellarPublicKey: wallet.publicKey,
      stellarSecretKeyEncrypted,
      funded: wallet.funded,
      initialBalance: wallet.initialBalance,
      isVerified: false,
      isBanned: false,
      suspiciousActivityCount: 0,
      createdAt: new Date()
    };

    users.push(user);
    console.log(`✅ User created with wallet: ${wallet.publicKey}`);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        stellarPublicKey: user.stellarPublicKey,
        funded: user.funded,
        isVerified: user.isVerified,
        isBanned: user.isBanned,
        suspiciousActivityCount: user.suspiciousActivityCount
      }
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ error: 'Failed to create account: ' + error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('\n=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Total users:', users.length);
    console.log('User emails:', users.map(u => u.email));
    
    // Ensure default users exist
    await createDefaultUsers();
    
    const user = users.find(u => u.email === email);
    console.log('User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('❌ User not found');
      console.log('===================\n');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    console.log('Password match:', passwordMatch ? 'YES' : 'NO');
    
    if (!passwordMatch) {
      console.log('❌ Invalid password');
      console.log('===================\n');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    
    console.log('✅ Login successful');
    console.log('===================\n');
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        stellarPublicKey: user.stellarPublicKey,
        isVerified: user.isVerified || false,
        isBanned: user.isBanned || false,
        suspiciousActivityCount: user.suspiciousActivityCount || 0
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Export users for other routes
router.getUsers = () => users;

// Report suspicious activity
router.post('/report-suspicious', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.suspiciousActivityCount = (user.suspiciousActivityCount || 0) + 1;
    
    // Auto-ban if suspicious activity count >= 3
    if (user.suspiciousActivityCount >= 3) {
      user.isBanned = true;
    }
    
    res.json({ 
      success: true, 
      suspiciousActivityCount: user.suspiciousActivityCount,
      isBanned: user.isBanned
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to report suspicious activity' });
  }
});

// Verify merchant
router.post('/verify-merchant', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.isVerified = true;
    
    res.json({ success: true, isVerified: user.isVerified });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify merchant' });
  }
});

module.exports = router;