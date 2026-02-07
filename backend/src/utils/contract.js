const StellarSdk = require('stellar-sdk');
const { decryptSecretKey } = require('./stellar');

const CONTRACT_ADDRESS = 'MOCK_CONTRACT_FOR_HACKATHON_DEMO';

async function createPaymentEscrow(userSecretKey, merchantPublicKey, amount, paymentId, upiId) {
  // Mock contract call for hackathon demo
  console.log('Mock: Creating payment escrow', { paymentId, amount, upiId });
  return 'mock_tx_hash_' + Date.now();
}

async function confirmUPIPayment(merchantSecretKey, paymentId) {
  // Mock contract call for hackathon demo
  console.log('Mock: Confirming UPI payment', { paymentId });
  return 'mock_confirm_hash_' + Date.now();
}

async function releaseXLM(paymentId) {
  // Mock contract call for hackathon demo
  console.log('Mock: Releasing XLM', { paymentId });
  return 'mock_release_hash_' + Date.now();
}

module.exports = {
  createPaymentEscrow,
  confirmUPIPayment,
  releaseXLM
};