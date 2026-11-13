# FAMILY SHOP — সম্পূর্ণ প্রজেক্ট (বাংলাদেশি অনলাইন ফ্যামিলি শপ)

এই ZIP ফাইলের মধ্যে Frontend, Backend, Database Model, API, Admin Dashboard এবং চালানোর নির্দেশনা দেওয়া আছে।

## ১) আগে যা ইনস্টল করবে
1. Node.js (LTS): https://nodejs.org/
2. MongoDB Community Server অথবা MongoDB Atlas
3. VS Code

Node ইনস্টল হয়েছে কি না দেখতে VS Code Terminal-এ চালাও:
```bash
node -v
npm -v
```

## ২) ZIP Extract করো
`family-shop-complete.zip` Extract করে VS Code-এ `family-shop` ফোল্ডার Open করো।

ফোল্ডার:
```text
family-shop/
  backend/
    config/          (পরবর্তীতে config রাখার জায়গা)
    middleware/      (JWT authentication)
    models/          (MongoDB User, Product, Order)
    routes/          (Auth, Product, Order API)
    .env.example
    package.json
    seed.js
    server.js
  frontend/
    src/
      context/        (Cart state)
      App.jsx
      api.js
      main.jsx
      styles.css
    index.html
    package.json
    vite.config.js
  README.md
  STEP_BY_STEP_BN.md
```

## ৩) MongoDB চালু করো
### Local MongoDB
MongoDB Community Server ইনস্টল করে MongoDB service চালু রাখো। `.env`-এ:
```env
MONGO_URI=mongodb://127.0.0.1:27017/family_shop
```

### MongoDB Atlas
Atlas-এ একটি database cluster তৈরি করে connection string কপি করো। `.env`-এ `MONGO_URI` হিসেবে বসাও। Atlas Network Access-এ নিজের IP allow করো। Database user-এর password connection string-এ সঠিকভাবে বসাও।

## ৪) Backend সেটআপ
VS Code Terminal-এ:
```bash
cd backend
```
Windows PowerShell/CMD:
```bash
copy .env.example .env
```
macOS/Linux:
```bash
cp .env.example .env
```

`backend/.env` খুলে নিচের মতো সেট করো:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/family_shop
JWT_SECRET=এখানে_কমপক্ষে_৩২_অক্ষরের_একটি_গোপন_র‍্যান্ডম_সিক্রেট_দাও
CLIENT_URL=http://localhost:5173
```
নিজের MongoDB URI ব্যবহার করবে। `.env` কখনো GitHub-এ আপলোড করবে না।

তারপর:
```bash
npm install
npm run seed
npm run dev
```
সফল হলে API চলবে `http://localhost:5000` ঠিকানায়।
Health check: `http://localhost:5000/api/health`

## ৫) Frontend চালু করো
নতুন Terminal খুলে project root থেকে:
```bash
cd frontend
npm install
npm run dev
```
Terminal-এ দেখানো Vite address খোলো। সাধারণত:
`http://localhost:5173`

## ৬) Admin Login
প্রাথমিক Admin:
- Email: `admin@familyshop.com`
- Password: `Admin123!`

Admin panel:
`http://localhost:5173/admin`

প্রথমেই এই demo password বদলে শক্তিশালী password ব্যবহার করো। Public server-এ seed command চালানোর আগে seed.js-এর demo credential পরিবর্তন করো।

## ৭) Customer হিসেবে পরীক্ষা
1. Home page থেকে Shop-এ যাও।
2. Product-এ Add চাপো।
3. Cart খুলে quantity বদলাও।
4. Register করে account বানাও।
5. Checkout-এ নাম, ফোন, ঠিকানা, জেলা, উপজেলা দাও।
6. Place order চাপো।
7. My Orders-এ order status দেখো।

## ৮) Admin হিসেবে পরীক্ষা
1. Admin email/password দিয়ে login করো।
2. `/admin` খোলো।
3. নতুন product যোগ করো।
4. Product delete করো।
5. Customer order-এর status পরিবর্তন করো।

## ৯) এই ভার্সনে কী কাজ করে
- Responsive React storefront
- Product category/search
- Product details
- Cart (browser LocalStorage-এ থাকে)
- Customer registration/login (JWT)
- MongoDB user/product/order data
- Checkout with Cash on Delivery
- Customer order history
- Admin summary, product add/delete, order status update

## ১০) এখনো আলাদা করে integrate করতে হবে
- bKash/Nagad/SSLCommerz: merchant account, API credentials, callback/webhook এবং server-side verification লাগবে। এই ZIP-এ live gateway payment চালু নেই।
- Wishlist UI/API
- Product edit UI
- Inventory transaction/audit
- Delivery partner API
- SMS/email notification
- Invoice PDF
- Production deployment, HTTPS, rate limiting, backups, monitoring, security review

## সমস্যা হলে
- `MongoDB connection failed`: MongoDB service/Atlas URI পরীক্ষা করো।
- `Failed to fetch`: backend terminal-এ `npm run dev` চলছে কি না দেখো।
- `401`: আবার login করো।
- `Cannot find module`: সংশ্লিষ্ট `backend` বা `frontend` ফোল্ডারে গিয়ে `npm install` করো।
- Port busy: অন্য process বন্ধ করো অথবা PORT পরিবর্তন করো।

এটি শেখা, ডেমো এবং MVP-এর জন্য starter project। বাস্তব ব্যবসায় চালুর আগে security review, payment verification, privacy policy, return/refund policy এবং delivery workflow সম্পূর্ণ করতে হবে।
