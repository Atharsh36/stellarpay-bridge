#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, symbol_short};

#[contracttype]
pub enum DataKey {
    Payment(u64),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Payment {
    pub id: u64,
    pub user: Address,
    pub merchant: Address,
    pub amount: i128,
    pub status: Symbol,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Create a new payment escrow
    pub fn create_payment(
        env: Env,
        id: u64,
        user: Address,
        merchant: Address,
        amount: i128,
    ) -> bool {
        user.require_auth();
        
        let payment = Payment {
            id,
            user: user.clone(),
            merchant,
            amount,
            status: symbol_short!("PENDING"),
        };
        
        env.storage().persistent().set(&DataKey::Payment(id), &payment);
        true
    }
    
    /// Merchant confirms UPI payment and releases XLM
    pub fn confirm_payment(env: Env, id: u64, merchant: Address) -> bool {
        merchant.require_auth();
        
        let key = DataKey::Payment(id);
        let mut payment: Payment = env.storage().persistent().get(&key).unwrap();
        
        // Verify merchant
        if payment.merchant != merchant {
            panic!("Unauthorized merchant");
        }
        
        // Update status
        payment.status = symbol_short!("COMPLETE");
        env.storage().persistent().set(&key, &payment);
        
        true
    }
    
    /// Get payment details
    pub fn get_payment(env: Env, id: u64) -> Payment {
        let key = DataKey::Payment(id);
        env.storage().persistent().get(&key).unwrap()
    }
    
    /// Cancel payment (only by user)
    pub fn cancel_payment(env: Env, id: u64, user: Address) -> bool {
        user.require_auth();
        
        let key = DataKey::Payment(id);
        let mut payment: Payment = env.storage().persistent().get(&key).unwrap();
        
        // Verify user
        if payment.user != user {
            panic!("Unauthorized user");
        }
        
        // Update status
        payment.status = symbol_short!("CANCELED");
        env.storage().persistent().set(&key, &payment);
        
        true
    }
}