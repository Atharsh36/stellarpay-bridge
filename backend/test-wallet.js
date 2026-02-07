const { generateWallet } = require('./src/services/stellarWalletService');

async function testWallet() {
  try {
    console.log('Testing real Stellar wallet generation...');
    const wallet = await generateWallet();
    console.log('SUCCESS!');
    console.log('Public Key:', wallet.publicKey);
    console.log('Public Key Length:', wallet.publicKey.length);
    console.log('Starts with G:', wallet.publicKey.startsWith('G'));
    console.log('Funded:', wallet.funded);
    console.log('Balance:', wallet.initialBalance);
  } catch (error) {
    console.error('FAILED:', error.message);
  }
}

testWallet();