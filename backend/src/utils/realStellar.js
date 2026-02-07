// Real Stellar Wallet Integration
const StellarSdk = require('stellar-sdk');

// Use real Stellar SDK
function generateRealStellarWallet() {
  const keypair = StellarSdk.Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret()
  };
}

async function getRealBalance(publicKey) {
  const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
  try {
    const account = await server.loadAccount(publicKey);
    const xlmBalance = account.balances.find(balance => balance.asset_type === 'native');
    return parseFloat(xlmBalance.balance);
  } catch (error) {
    return 0; // Account not funded
  }
}

async function fundTestnetAccount(publicKey) {
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

module.exports = {
  generateRealStellarWallet,
  getRealBalance,
  fundTestnetAccount
};