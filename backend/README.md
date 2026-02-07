# StellarPay Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup environment:
```bash
cp .env.example .env
# Edit .env with your database URL and secrets
```

3. Setup database:
```bash
npm run db:generate
npm run db:push
```

4. Start development server:
```bash
npm run dev
```

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/payments/create` - Create payment request
- `GET /api/payments/requests` - Get payment requests
- `POST /api/payments/confirm/:id` - Confirm payment