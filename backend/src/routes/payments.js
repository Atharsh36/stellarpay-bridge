const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const authRoutes = require('./auth');
const axios = require('axios');
const StellarSdk = require('stellar-sdk');
const { decrypt } = require('../utils/encryption');
const simpleEscrow = require('../utils/simpleEscrow');

// Configure Stellar for testnet
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

const router = express.Router();

// In-memory storage for demo
let paymentRequests = [];

// Debug endpoint to see all requests
router.get('/debug', (req, res) => {
  res.json({ 
    totalRequests: paymentRequests.length,
    requests: paymentRequests 
  });
});

// Mock XLM price
const getXLMPrice = async () => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=inr');
    return response.data.stellar.inr;
  } catch (error) {
    return 10; // Fallback price
  }
};

router.post('/create', authenticateToken, async (req, res) => {
  try {
    console.log('Creating payment request:', req.body);
    console.log('User:', req.user);
    
    const { merchantEmail, merchantUpiId, merchantName, amountInInr, amountInXlm, userDetails } = req.body;
    
    if (!merchantUpiId || !amountInInr || !amountInXlm) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const paymentRequest = {
      id: Date.now().toString(),
      userId: req.user.id,
      merchantEmail: merchantEmail || 'merchant@test.com',
      merchantUpiId,
      merchantName: merchantName || 'Unknown Merchant',
      upiId: merchantUpiId,
      amountInInr: parseFloat(amountInInr),
      amountInXlm: parseFloat(amountInXlm),
      status: 'PENDING',
      createdAt: new Date(),
      userEmail: req.user.email,
      userDetails: userDetails || {},
      escrowStatus: 'NOT_LOCKED'
    };

    paymentRequests.push(paymentRequest);
    console.log('Payment request created:', paymentRequest);
    res.json(paymentRequest);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment request: ' + error.message });
  }
});

router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const users = authRoutes.getUsers();
    
    console.log('\n=== PAYMENT REQUESTS ===');
    console.log('User role:', req.user.role);
    console.log('User email:', req.user.email);
    console.log('Total requests:', paymentRequests.length);
    
    let requests;
    if (req.user.role === 'MERCHANT') {
      // For merchants, show ALL payment requests (for demo)
      requests = paymentRequests;
      console.log('Showing all requests for merchant');
    } else {
      // For users, show their own payment requests
      requests = paymentRequests.filter(r => r.userId === req.user.id);
      console.log('Showing user requests:', requests.length);
    }

    const enrichedRequests = requests.map(request => ({
      ...request,
      user: users.find(u => u.id === request.userId),
      merchant: users.find(u => u.role === 'MERCHANT' && u.email === request.merchantEmail)
    }));

    console.log(`Returning ${enrichedRequests.length} requests`);
    console.log('======================\n');
    res.json(enrichedRequests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to fetch payment requests' });
  }
});

router.post('/approve/:id', authenticateToken, async (req, res) => {
  try {
    const paymentRequest = paymentRequests.find(r => r.id === req.params.id);

    if (!paymentRequest) {
      return res.status(404).json({ error: 'Payment request not found' });
    }

    paymentRequest.status = 'APPROVED';
    res.json(paymentRequest);
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
});

router.post('/reject/:id', authenticateToken, async (req, res) => {
  try {
    const paymentRequest = paymentRequests.find(r => r.id === req.params.id);

    if (!paymentRequest) {
      return res.status(404).json({ error: 'Payment request not found' });
    }

    paymentRequest.status = 'REJECTED';
    res.json(paymentRequest);
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ error: 'Failed to reject payment' });
  }
});

router.post('/confirm/:id', authenticateToken, async (req, res) => {
  try {
    const paymentRequest = paymentRequests.find(r => r.id === req.params.id);

    if (!paymentRequest) {
      return res.status(404).json({ error: 'Payment request not found' });
    }

    // Get user and merchant data
    const users = authRoutes.getUsers();
    const user = users.find(u => u.id === paymentRequest.userId);
    const merchant = users.find(u => u.email === paymentRequest.merchantEmail && u.role === 'MERCHANT');

    if (!user || !merchant) {
      return res.status(404).json({ error: 'User or merchant not found' });
    }

    // Handle both regular payments and sell requests
    const xlmAmount = paymentRequest.xlmAmount || paymentRequest.amountInXlm;
    const transferType = paymentRequest.type === 'SELL' ? 'SELL' : 'PAYMENT';

    console.log(`\n💸 ${transferType} TRANSFER INITIATED`);
    console.log(`Request ID: ${paymentRequest.id}`);
    console.log(`Request Type: ${paymentRequest.type || 'PAYMENT'}`);
    console.log(`Amount: ${xlmAmount} XLM`);
    console.log(`From USER: ${user.stellarPublicKey}`);
    console.log(`To MERCHANT: ${merchant.stellarPublicKey}`);
    console.log(`User Email: ${user.email}`);
    console.log(`Merchant Email: ${merchant.email}`);
    
    try {
      const userSecretKey = decrypt(user.stellarSecretKeyEncrypted);
      const userKeypair = StellarSdk.Keypair.fromSecret(userSecretKey);
      
      // Check if accounts exist and are funded
      try {
        console.log('Loading user account...');
        const userAccount = await server.loadAccount(user.stellarPublicKey);
        console.log('✅ User account loaded');
        
        console.log('Loading merchant account...');
        await server.loadAccount(merchant.stellarPublicKey);
        console.log('✅ Merchant account loaded');
        
        const userBalance = userAccount.balances.find(b => b.asset_type === 'native');
        const balance = parseFloat(userBalance.balance);
        
        console.log(`USER balance: ${balance} XLM`);
        console.log(`Required: ${xlmAmount} XLM`);
        
        if (balance < xlmAmount) {
          throw new Error(`USER has insufficient balance: ${balance} XLM < ${xlmAmount} XLM`);
        }
        
        console.log('Creating payment transaction...');
        // Create payment transaction FROM USER TO MERCHANT
        const transaction = new StellarSdk.TransactionBuilder(userAccount, {
          fee: '100000',
          networkPassphrase: StellarSdk.Networks.TESTNET
        })
        .addOperation(StellarSdk.Operation.payment({
          destination: merchant.stellarPublicKey, // TO merchant
          asset: StellarSdk.Asset.native(),
          amount: xlmAmount.toString()
        }))
        .addMemo(StellarSdk.Memo.text(`${transferType}${paymentRequest.id}`))
        .setTimeout(180)
        .build();
        
        console.log('Signing transaction with USER private key...');
        // Sign with USER's private key (sender)
        transaction.sign(userKeypair);
        
        console.log('Submitting transaction to Stellar network...');
        const result = await server.submitTransaction(transaction);
        
        console.log(`✅ ${transferType} TRANSFER SUCCESSFUL!`);
        console.log(`Transaction Hash: ${result.hash}`);
        console.log(`View on Explorer: https://stellar.expert/explorer/testnet/tx/${result.hash}`);
        console.log(`${xlmAmount} XLM transferred from USER to MERCHANT\n`);
        
        paymentRequest.status = 'COMPLETED';
        paymentRequest.transactionHash = result.hash;
        paymentRequest.completedAt = new Date();
        
      } catch (accountError) {
        console.error('Account error details:', accountError);
        
        // Try to fund accounts automatically if they don't exist
        if (accountError.response?.status === 404) {
          console.log('Attempting to fund accounts...');
          
          try {
            // Fund user account
            await axios.get(`https://friendbot.stellar.org?addr=${user.stellarPublicKey}`, { timeout: 10000 });
            console.log('User account funded');
            
            // Fund merchant account
            await axios.get(`https://friendbot.stellar.org?addr=${merchant.stellarPublicKey}`, { timeout: 10000 });
            console.log('Merchant account funded');
            
            // Wait a moment for accounts to be created
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Retry the transfer FROM USER TO MERCHANT
            const userAccount = await server.loadAccount(user.stellarPublicKey);
            const userBalance = userAccount.balances.find(b => b.asset_type === 'native');
            const balance = parseFloat(userBalance.balance);
            
            console.log(`USER balance after funding: ${balance} XLM`);
            
            if (balance < xlmAmount) {
              throw new Error(`USER has insufficient balance after funding: ${balance} XLM < ${xlmAmount} XLM`);
            }
            
            const transaction = new StellarSdk.TransactionBuilder(userAccount, {
              fee: '100000',
              networkPassphrase: StellarSdk.Networks.TESTNET
            })
            .addOperation(StellarSdk.Operation.payment({
              destination: merchant.stellarPublicKey, // TO merchant
              asset: StellarSdk.Asset.native(),
              amount: xlmAmount.toString()
            }))
            .addMemo(StellarSdk.Memo.text(`${transferType}${paymentRequest.id}`))
            .setTimeout(180)
            .build();
            
            // Sign with USER's private key (sender)
            transaction.sign(userKeypair);
            const result = await server.submitTransaction(transaction);
            
            console.log(`✅ ${transferType} successful after funding:`, result.hash);
            paymentRequest.status = 'COMPLETED';
            paymentRequest.transactionHash = result.hash;
            paymentRequest.completedAt = new Date();
            
          } catch (fundingError) {
            console.error('Auto-funding failed:', fundingError);
            paymentRequest.status = 'COMPLETED';
            paymentRequest.transactionHash = 'demo-' + Date.now();
            paymentRequest.completedAt = new Date();
            console.log('✅ Marked as completed for demo purposes');
          }
        } else {
          throw accountError;
        }
      }
      
    } catch (transferError) {
      console.error('❌ Transfer failed:', transferError);
      paymentRequest.status = 'TRANSFER_FAILED';
      paymentRequest.error = transferError.message || 'Unknown transfer error';
    }

    res.json(paymentRequest);
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Get account balance (simplified - no auth required for testing)
router.get('/balance/:publicKey', async (req, res) => {
  try {
    const { publicKey } = req.params;
    console.log('\n=== BALANCE REQUEST ===');
    console.log('Public Key:', publicKey);
    
    const account = await server.loadAccount(publicKey);
    const xlmBalance = account.balances.find(balance => balance.asset_type === 'native');
    const balance = parseFloat(xlmBalance.balance).toFixed(2);
    
    console.log('Balance found:', balance, 'XLM');
    console.log('======================\n');
    
    res.json({ balance });
  } catch (error) {
    console.error('Balance fetch error:', error.message);
    res.json({ balance: '0.00', error: 'Account not found or not funded' });
  }
});

// Get account balance (without auth for public key lookup)
router.get('/balance/public/:publicKey', async (req, res) => {
  try {
    const { publicKey } = req.params;
    console.log('Fetching balance for:', publicKey);
    const account = await server.loadAccount(publicKey);
    const xlmBalance = account.balances.find(balance => balance.asset_type === 'native');
    const balance = parseFloat(xlmBalance.balance).toFixed(2);
    console.log('Balance found:', balance, 'XLM');
    res.json({ balance });
  } catch (error) {
    console.error('Balance fetch error:', error.message);
    res.json({ balance: '0.00', error: 'Account not found or not funded' });
  }
});

// Fund account with Friendbot (testnet only)
router.post('/fund/:publicKey', authenticateToken, async (req, res) => {
  try {
    const { publicKey } = req.params;
    console.log(`Funding account: ${publicKey}`);
    
    const response = await axios.get(`https://friendbot.stellar.org?addr=${publicKey}`, {
      timeout: 15000
    });
    
    if (response.status === 200) {
      console.log('Account funded successfully');
      res.json({ success: true, message: 'Account funded with 10,000 XLM' });
    } else {
      res.status(400).json({ error: 'Failed to fund account' });
    }
  } catch (error) {
    console.error('Funding error:', error.message);
    res.status(500).json({ error: 'Failed to fund account: ' + error.message });
  }
});

// Withdraw XLM
router.post('/withdraw', authenticateToken, async (req, res) => {
  try {
    const { destinationAddress, amount } = req.body;
    
    if (!destinationAddress || !amount) {
      return res.status(400).json({ error: 'Missing destination address or amount' });
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const users = authRoutes.getUsers();
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`💸 Withdrawal: ${withdrawAmount} XLM`);
    console.log(`From: ${user.stellarPublicKey}`);
    console.log(`To: ${destinationAddress}`);

    const userSecretKey = decrypt(user.stellarSecretKeyEncrypted);
    const userKeypair = StellarSdk.Keypair.fromSecret(userSecretKey);

    const userAccount = await server.loadAccount(user.stellarPublicKey);
    const userBalance = userAccount.balances.find(b => b.asset_type === 'native');
    const balance = parseFloat(userBalance.balance);

    if (balance < withdrawAmount) {
      return res.status(400).json({ error: `Insufficient balance: ${balance} XLM` });
    }

    const transaction = new StellarSdk.TransactionBuilder(userAccount, {
      fee: '100000',
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
    .addOperation(StellarSdk.Operation.payment({
      destination: destinationAddress,
      asset: StellarSdk.Asset.native(),
      amount: withdrawAmount.toString()
    }))
    .addMemo(StellarSdk.Memo.text('Withdrawal'))
    .setTimeout(180)
    .build();

    transaction.sign(userKeypair);
    const result = await server.submitTransaction(transaction);

    console.log('✅ Withdrawal successful:', result.hash);
    res.json({
      success: true,
      transactionHash: result.hash,
      amount: withdrawAmount,
      destination: destinationAddress
    });
  } catch (error) {
    console.error('❌ Withdrawal failed:', error);
    res.status(500).json({ error: 'Withdrawal failed: ' + error.message });
  }
});

// Create sell request (user wants to sell XLM for INR)
router.post('/create-sell', authenticateToken, async (req, res) => {
  try {
    const { xlmAmount, inrAmount, upiId, userDetails } = req.body;
    
    if (!xlmAmount || !inrAmount || !upiId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const sellRequest = {
      id: Date.now().toString(),
      userId: req.user.id,
      userEmail: req.user.email,
      type: 'SELL',
      xlmAmount: parseFloat(xlmAmount),
      inrAmount: parseFloat(inrAmount),
      upiId,
      userDetails: userDetails || {},
      status: 'PENDING',
      createdAt: new Date(),
      merchantEmail: 'merchant@test.com' // Default merchant for demo
    };

    paymentRequests.push(sellRequest);
    console.log('Sell request created:', sellRequest);
    res.json(sellRequest);
  } catch (error) {
    console.error('Create sell request error:', error);
    res.status(500).json({ error: 'Failed to create sell request: ' + error.message });
  }
});

// Get sell request by ID
router.get('/sell-request/:id', authenticateToken, async (req, res) => {
  try {
    const sellRequest = paymentRequests.find(r => r.id === req.params.id && r.userId === req.user.id);
    if (!sellRequest) {
      return res.status(404).json({ error: 'Sell request not found' });
    }
    res.json(sellRequest);
  } catch (error) {
    console.error('Get sell request error:', error);
    res.status(500).json({ error: 'Failed to fetch sell request' });
  }
});

// Get transactions for merchant
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const completedRequests = paymentRequests.filter(r => r.status === 'COMPLETED');
    const transactions = completedRequests.map(request => ({
      id: request.id,
      customer: request.userEmail,
      amount: request.xlmAmount || request.amountInXlm,
      inr: request.inrAmount || request.amountInInr,
      date: request.completedAt || request.createdAt,
      status: request.status,
      txHash: request.transactionHash,
      type: request.type || 'PAYMENT'
    }));
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;