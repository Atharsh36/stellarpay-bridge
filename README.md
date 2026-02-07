# StellarPay Bridge

A crypto-to-fiat payment bridge connecting Stellar (XLM) with UPI payments.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Rust (for Soroban contract)

### 1. Clone and Setup
```bash
git clone <your-repo>
cd stellarbridge-pay
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL and secrets
npm run db:generate
npm run db:push
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### 4. Contract Setup
```bash
cd soroban-contract
cargo build --target wasm32-unknown-unknown --release
```

### 5. Quick Start (Windows)
```bash
./start.bat
```

## 🌟 Features

- **Dual Role System**: Users and Merchants
- **Automatic Stellar Wallets**: Generated on signup
- **Payment Bridge**: Crypto → UPI payments
- **Escrow System**: Soroban smart contracts
- **Real-time Updates**: Payment status tracking

## 🔄 Payment Flow

1. User creates payment request with merchant email and UPI ID
2. XLM is locked in Soroban escrow contract
3. Merchant receives notification
4. Merchant pays via UPI manually
5. Merchant clicks "I PAID" button
6. Smart contract releases XLM to merchant

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Blockchain**: Stellar SDK, Soroban (Rust)
- **Auth**: JWT tokens

## 📱 Usage

1. **Signup**: Choose USER or MERCHANT role
2. **Users**: Create payment requests by entering merchant email and UPI details
3. **Merchants**: View incoming requests and confirm UPI payments
4. **Smart Contract**: Automatically handles XLM escrow and release

## 🔐 Security

- Encrypted private keys in database
- JWT authentication
- Soroban smart contract escrow
- Input validation and sanitization

## 🚧 MVP Limitations

- Manual UPI confirmation (no automatic verification)
- Testnet only
- Basic UI/UX
- Mock price feeds

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://username:password@localhost:5432/stellarpay"
JWT_SECRET="your-super-secret-jwt-key"
STELLAR_NETWORK="testnet"
ENCRYPTION_KEY="your-32-char-encryption-key-here"
PORT=3001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🎯 Demo Flow

1. Register as MERCHANT with email: merchant@test.com
2. Register as USER with email: user@test.com
3. User creates payment to merchant@test.com
4. Merchant confirms payment
5. XLM transferred automatically

## 📞 Support

This is a hackathon MVP. For production use, implement:
- Real UPI verification
- Mainnet deployment
- Enhanced security
- Better error handling
- Mobile responsiveness