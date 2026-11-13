import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import { requireAuth, requireAdmin } from './middleware/auth.js';
import asyncRoute from './middleware/asyncRoute.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();
if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET === 'replace_this_with_a_long_random_secret') {
  throw new Error('Set JWT_SECRET to a random secret with at least 32 characters.');
}
const app = express();
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(value => value.trim());
app.disable('x-powered-by');
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  callback(new Error('Origin is not allowed by CORS.'));
} }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'Family Shop API' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/admin/summary', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const [products, orders, revenue, openOrders, lowStock, paymentsDue] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: 'Delivered', paymentStatus: 'Paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.countDocuments({ status: { $in: ['Pending', 'Confirmed', 'Processing', 'Out for delivery'] } }),
    Product.countDocuments({ stock: { $lte: 5 } }),
    Order.aggregate([{ $match: { status: 'Delivered', paymentStatus: 'Unpaid' } }, { $group: { _id: null, total: { $sum: '$total' } } }])
  ]);
  res.json({ products, orders, revenue: revenue[0]?.total || 0, openOrders, lowStock, paymentsDue: paymentsDue[0]?.total || 0 });
}));

app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Request body is too large.' });
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) return res.status(400).json({ message: 'Invalid JSON body.' });
  if (err.message === 'Origin is not allowed by CORS.') return res.status(403).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`Family Shop API running on ${port}`)))
  .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });

