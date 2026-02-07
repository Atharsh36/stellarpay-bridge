const StellarSdk = require('stellar-sdk');

// Configure Stellar for testnet
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

async function generateWallet() {
  try {
    console.log('🚀 Generating new Stellar wallet...');
    
    // Generate keypair using official Stellar SDK
    const keypair = StellarSdk.Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();
    
    // Validate proper Stellar format
    if (!publicKey.startsWith('G') || publicKey.length !== 56) {
      throw new Error(`Invalid public key format: ${publicKey}`);
    }
    
    console.log(`✅ Generated Stellar wallet: ${publicKey}`);
    
    return {
      publicKey,
      secretKey,
      funded: false,
      initialBalance: '0'
    };
  } catch (error) {
    console.error('❌ Wallet generation failed:', error.message);
    throw new Error(`Failed to generate wallet: ${error.message}`);
  }
}

async function getWalletBalance(publicKey) {
  try {
    console.log(`📊 Fetching wallet data for user: ${publicKey}`);
    
    // Validate public key format
    if (!publicKey.startsWith('G') || publicKey.length !== 56) {
      throw new Error('Invalid Stellar public key format');
    }
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    );
    
    const balancePromise = server.loadAccount(publicKey).then(account => {
      const xlmBalance = account.balances.find(balance => balance.asset_type === 'native');
      return xlmBalance ? parseFloat(xlmBalance.balance).toString() : '0';
    });
    
    const balance = await Promise.race([balancePromise, timeoutPromise]);
    console.log(`✅ Balance fetched: ${balance} XLM`);
    return balance;
    
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(`⏳ Account not found (not funded yet): ${publicKey}`);
      return '0';
    }
    console.error(`❌ Failed to fetch balance for ${publicKey}:`, error.message);
    return '0';
  }
}

module.exports = {
  generateWallet,
  getWalletBalance
};