# 🚀 StellarBridge Pay

StellarBridge Pay is a crypto-to-UPI payment bridge powered by the Stellar blockchain that enables users to pay anywhere using XLM, even when merchants only accept UPI.

---

## 📄 Project Description

StellarBridge Pay bridges blockchain payments (Stellar/XLM) with real-world UPI payments.  
It allows crypto holders to spend XLM in everyday life while merchants handle UPI payments and receive crypto securely through smart-contract escrow.

---

## 📍 Smart Contract Address

Soroban Escrow Contract (Stellar Testnet):

CC2DFCND6UJENJGHP6PEZ7NA4EZCS7Z5LPE3OTX2QEEMFMVTDLG7KYFH

---

## ❗ Problem Statement

Crypto adoption is growing, but real-world usability remains limited.

- Most merchants do not accept crypto
- UPI dominates daily payments in India
- Users must convert crypto → withdraw → pay via UPI
- This process is slow, costly, and inconvenient
- Peer-to-peer systems are vulnerable to fraud and misuse

As a result, crypto is still impractical for everyday payments.

---

## 💡 Solution

StellarBridge Pay introduces a crypto-to-UPI bridge using a merchant-proxy model secured by Soroban smart-contract escrow.

- Users pay in XLM
- Merchants pay in UPI
- Funds are locked on-chain until payment is confirmed
- Settlement is trustless and blockchain-verified

An automated monitoring agent detects suspicious activity and automatically flags or bans abusive users or merchants.

---

## ✨ Features

- Real Stellar wallet creation on signup
- Crypto (XLM) to UPI payment bridging
- UPI QR code scanning
- Soroban smart-contract escrow
- User and Merchant role separation
- Automated fraud and abuse detection agent
- Fast, low-fee Stellar transactions
- Transaction history and status tracking

---

## 🏗️ Architecture Overview

Frontend:
- Next.js
- Tailwind CSS
- QR Scanner integration

Backend:
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Stellar SDK

Blockchain:
- Stellar Testnet
- Soroban Smart Contracts (Rust)

Flow:
1. User initiates payment
2. XLM locked in escrow contract
3. Merchant pays via UPI
4. Merchant confirms payment
5. Smart contract releases XLM
6. Monitoring agent checks for suspicious behavior

---

## 🖼️ Screenshots

/screenshots
1. ---<img width="1907" height="900" alt="Screenshot 2026-02-08 035136" src="https://github.com/user-attachments/assets/e67a51ba-d6c7-4ebf-a3fc-14567a5662a4" />

2. <img width="1895" height="898" alt="Screenshot 2026-02-08 035309" src="https://github.com/user-attachments/assets/8600845c-d66e-4855-aaf0-9247091e401c" />

3. <img width="1904" height="895" alt="Screenshot 2026-02-08 035407" src="https://github.com/user-attachments/assets/1ae73704-2b62-499f-9c98-e0cf4996b69f" />


## 🌐 Deployed Link

Frontend:
DEPLOYED_FRONTEND_URL

Backend API:
DEPLOYED_BACKEND_URL

---

## 🚀 Future Scope and Plans

- Automated UPI payment verification
- Merchant reputation and trust scoring
- Cross-border remittances
- Mobile application
- Mainnet deployment
- AI-powered risk scoring
- Multi-currency support

---

## 🏷️ Project Category

- Crypto-to-Fiat Payment Bridge
- Web3 Payments Infrastructure
- Smart-Contract Escrow System
- Financial Inclusion Platform

---

## 📜 License

MIT License

