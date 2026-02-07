const StellarSdk = require('stellar-sdk');
const crypto = require('crypto');
const axios = require('axios');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'demo-key-32-chars-long-for-hack';
const ALGORITHM = 'aes-256-cbc';

// Configure Stellar for testnet
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

function generateRealStellarWallet() {
  // Generate REAL Stellar keypair using official Stellar SDK
  const keypair = StellarSdk.Keypair.random();
  
  console.log('Generated keypair:');
  console.log('Public Key:', keypair.publicKey());
  console.log('Secret Key:', keypair.secret());
  
  // Validate the generated keys
  if (!keypair.publicKey().startsWith('G') || keypair.publicKey().length !== 56) {
    throw new Error('Invalid public key format generated');
  }
  
  if (!keypair.secret().startsWith('S') || keypair.secret().length !== 56) {
    throw new Error('Invalid secret key format generated');
  }
  
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
    keypair: keypair
  };
}

function encryptSecretKey(secretKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(secretKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptSecretKey(encryptedKey) {
  const parts = encryptedKey.split(':');
  const encrypted = parts[1];
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Fund account with Friendbot
async function fundTestnetAccount(publicKey) {
  try {
    console.log(`🚀 Funding account: ${publicKey}`);
    const response = await axios.get(`https://friendbot.stellar.org?addr=${publicKey}`, {
      timeout: 15000
    });
    console.log(`✅ Friendbot response: ${response.status}`);
    return response.status === 200;
  } catch (error) {
    console.error('❌ Friendbot funding failed:', error.message);
    return false;
  }
}

// Get real balance from Stellar network
async function getAccountBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);
    const xlmBalance = account.balances.find(balance => balance.asset_type === 'native');
    return parseFloat(xlmBalance.balance);
  } catch (error) {
    console.log(`Account ${publicKey} not found on network`);
    return 0;
  }
}

// Create real funded Stellar account
async function createRealStellarAccount() {
  console.log('🔑 Generating real Stellar wallet...');
  
  const wallet = generateRealStellarWallet();
  
  console.log(`✅ Generated valid Stellar wallet:`);
  console.log(`   Public: ${wallet.publicKey}`);
  console.log(`   Secret: ${wallet.secretKey.substring(0, 10)}...`);
  
  // Fund the account
  const funded = await fundTestnetAccount(wallet.publicKey);
  
  if (funded) {
    // Wait for account creation
    console.log('⏳ Waiting for account activation...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verify funding
    const balance = await getAccountBalance(wallet.publicKey);
    console.log(`💰 Account funded with ${balance} XLM`);
    
    return {
      ...wallet,
      balance,
      funded: true
    };
  } else {
    console.log('⚠️ Funding failed, but wallet is valid');
    return {
      ...wallet,
      balance: 0,
      funded: false
    };
  }
}

module.exports = {
  generateRealStellarWallet,
  encryptSecretKey,
  decryptSecretKey,
  getAccountBalance,
  createRealStellarAccount,
  fundTestnetAccount
};