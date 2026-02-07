const StellarSdk = require('stellar-sdk');

console.log('Testing Stellar SDK...');

// Test keypair generation
const keypair = StellarSdk.Keypair.random();
console.log('Generated keypair:');
console.log('Public Key:', keypair.publicKey());
console.log('Secret Key:', keypair.secret());
console.log('Public Key Length:', keypair.publicKey().length);
console.log('Secret Key Length:', keypair.secret().length);
console.log('Public Key starts with G:', keypair.publicKey().startsWith('G'));
console.log('Secret Key starts with S:', keypair.secret().startsWith('S'));