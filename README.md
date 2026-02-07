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
- landing-page.png
- login-page.png
- user-dashboard.png
- merchant-dashboard.png

---

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

