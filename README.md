# Family Shop — React + Express + MongoDB

A full-stack starter for a Bangladeshi family grocery shop.

## Requirements
- Node.js 20+
- MongoDB local or MongoDB Atlas account

## Run locally

### 1. Backend
```bash
cd backend
cp .env.example .env
npm install
```
Update `backend/.env` with your MongoDB URI, a unique JWT secret (at least 32 characters), and the frontend origin. Set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` (at least 12 characters) before the first seed. Then run:
```bash
npm run seed
npm run dev
```

Seeding does not reset existing admin credentials or product stock.

### 2. Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal (usually http://localhost:5173).

## Included
- Responsive React storefront
- Product search and category filtering
- Cart with quantity controls
- Register/login with JWT
- Checkout and order creation
- Customer order history
- Admin dashboard: product create/update/delete, price and inventory management, order fulfillment, and cash-on-delivery payment tracking
- Finance and operations overview: paid sales, delivered payments due, open orders, and low-stock products
- MongoDB models and Express API

The backend validates `MONGO_URI` and requires a unique `JWT_SECRET` of at least 32 characters before it starts. Set `CLIENT_URL` to the exact frontend origin (comma-separated origins are supported).

## Important production notes
- This is a working MVP starter, not a fully audited production commerce platform.
- Payment currently supports Cash on Delivery. bKash/Nagad/SSLCommerz need merchant credentials and server-side verification; never collect or store wallet PIN/OTP.
- Configure HTTPS, secure secrets, rate limiting at the hosting/reverse-proxy layer, email/SMS notifications, image storage, backups, and payment verification before launch.


## বাংলা Step-by-step guide
প্রথমে `STEP_BY_STEP_BN.md` ফাইলটি পড়ুন। সেখানে ইনস্টলেশন, MongoDB, Backend, Frontend, Admin Login এবং testing-এর সব ধাপ দেওয়া আছে।
