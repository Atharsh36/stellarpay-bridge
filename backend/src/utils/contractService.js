const StellarSdk = require('stellar-sdk');
const { decrypt } = require('./encryption');

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

// Mock contract address - replace with actual deployed contract
const CONTRACT_ADDRESS = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHAGK6XYU';

class ContractService {
  
  async createEscrowPayment(userSecretKey, merchantAddress, amount, paymentId) {
    try {
      const userKeypair = StellarSdk.Keypair.fromSecret(userSecretKey);
      const userAccount = await server.loadAccount(userKeypair.publicKey());
      
      // Create contract invocation to lock XLM in escrow
      const transaction = new StellarSdk.TransactionBuilder(userAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET
      })
      .addOperation(StellarSdk.Operation.invokeContract({
        contract: CONTRACT_ADDRESS,
        function: 'create_payment',
        args: [
          StellarSdk.nativeToScVal(paymentId, { type: 'symbol' }),
          StellarSdk.nativeToScVal(userKeypair.publicKey(), { type: 'address' }),
          StellarSdk.nativeToScVal(merchantAddress, { type: 'address' }),
          StellarSdk.nativeToScVal(amount * 10000000, { type: 'i128' }), // Convert to stroops
          StellarSdk.nativeToScVal('upi_payment', { type: 'symbol' })
        ]
      }))
      .setTimeout(30)
      .build();
      
      transaction.sign(userKeypair);
      const result = await server.submitTransaction(transaction);
      
      return {
        success: true,
        transactionHash: result.hash,
        contractAddress: CONTRACT_ADDRESS
      };
      
    } catch (error) {
      console.error('Contract escrow error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async confirmPaymentAndRelease(merchantSecretKey, paymentId) {
    try {
      const merchantKeypair = StellarSdk.Keypair.fromSecret(merchantSecretKey);
      const merchantAccount = await server.loadAccount(merchantKeypair.publicKey());
      
      // Call contract to confirm UPI payment and release XLM
      const transaction = new StellarSdk.TransactionBuilder(merchantAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET
      })
      .addOperation(StellarSdk.Operation.invokeContract({
        contract: CONTRACT_ADDRESS,
        function: 'confirm_upi_payment',
        args: [
          StellarSdk.nativeToScVal(paymentId, { type: 'symbol' })
        ]
      }))
      .setTimeout(30)
      .build();
      
      transaction.sign(merchantKeypair);
      const result = await server.submitTransaction(transaction);
      
      return {
        success: true,
        transactionHash: result.hash
      };
      
    } catch (error) {
      console.error('Contract release error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async getPaymentStatus(paymentId) {
    try {
      // Query contract for payment status
      const result = await server.getContractData(CONTRACT_ADDRESS, 
        StellarSdk.nativeToScVal(paymentId, { type: 'symbol' })
      );
      
      return result;
    } catch (error) {
      console.error('Contract query error:', error);
      return null;
    }
  }
}

module.exports = new ContractService();