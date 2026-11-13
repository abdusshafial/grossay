import { Router } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import asyncRoute from '../middleware/asyncRoute.js';
const router = Router();

router.post('/', requireAuth, asyncRoute(async (req, res) => {
  const reserved = [];
  try {
    const { items, customer } = req.body || {};
    if (!Array.isArray(items) || !items.length || items.length > 50 || !customer?.name || !customer?.phone || !customer?.address || !customer?.district)
      return res.status(400).json({ message: 'Please complete your cart and delivery details.' });
    const quantities = new Map();
    for (const line of items) {
      const id = String(line.productId || '');
      const quantity = Number(line.quantity);
      if (!/^[a-f\d]{24}$/i.test(id) || !Number.isSafeInteger(quantity) || quantity < 1)
        return res.status(400).json({ message: 'Cart contains an invalid product or quantity.' });
      quantities.set(id, (quantities.get(id) || 0) + quantity);
    }
    if ([...quantities.values()].some(quantity => quantity > 1000))
      return res.status(400).json({ message: 'Quantity exceeds the allowed limit.' });
    let subtotal = 0; const safeItems = [];
    for (const [id, quantity] of quantities) {
      const product = await Product.findOneAndUpdate({ _id: id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } }, { new: true });
      if (!product) throw Object.assign(new Error('A product is unavailable or has insufficient stock. Refresh your cart and try again.'), { status: 409 });
      reserved.push({ id: product._id, quantity });
      subtotal += product.price * quantity;
      safeItems.push({ product: product._id, name: product.name, price: product.price, quantity, image: product.image, unit: product.unit });
    }
    const deliveryFee = subtotal >= 1500 ? 0 : 60;
    const cleanCustomer = Object.fromEntries(['name','phone','address','district','upazila'].map(key => [key, String(customer[key] || '').trim()]));
    if (Object.values(cleanCustomer).some(value => value.length > 500)) throw Object.assign(new Error('Delivery details are too long.'), { status: 400 });
    const order = await Order.create({ user: req.user._id, items: safeItems, customer: cleanCustomer, subtotal, deliveryFee, total: subtotal + deliveryFee });
    res.status(201).json(order);
  } catch (e) {
    await Promise.all(reserved.map(item => Product.updateOne({ _id: item.id }, { $inc: { stock: item.quantity } })));
    if (e.status) return res.status(e.status).json({ message: e.message });
    if (e.name === 'ValidationError' || e.name === 'CastError') return res.status(400).json({ message: e.message });
    throw e;
  }
}));
router.get('/my', requireAuth, asyncRoute(async (req, res) => res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }))));
router.get('/', requireAuth, requireAdmin, asyncRoute(async (_req, res) => res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 }))));
router.patch('/:id/status', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const status = req.body?.status;
  const allowed = ['Pending','Confirmed','Processing','Out for delivery','Delivered','Cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid order status.' });
  const current = await Order.findById(req.params.id);
  if (!current) return res.status(404).json({ message: 'Order not found.' });
  if (current.status === 'Cancelled' || current.status === 'Delivered')
    return res.status(409).json({ message: 'This order can no longer be changed.' });
  const order = await Order.findOneAndUpdate({ _id: current._id, status: current.status }, { status }, { new: true });
  if (!order) return res.status(409).json({ message: 'Order was changed by another request. Refresh and try again.' });
  if (status === 'Cancelled') {
    await Promise.all(order.items.map(line => Product.updateOne({ _id: line.product }, { $inc: { stock: line.quantity } })));
  }
  res.json(order);
}));
router.patch('/:id/payment-status', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const paymentStatus = req.body?.paymentStatus;
  if (!['Unpaid', 'Paid'].includes(paymentStatus)) return res.status(400).json({ message: 'Invalid payment status.' });
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  if (paymentStatus === 'Paid' && order.status !== 'Delivered')
    return res.status(409).json({ message: 'Mark payment as paid after the order is delivered and cash is collected.' });
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: order.status, paymentStatus: order.paymentStatus },
    { paymentStatus },
    { new: true, runValidators: true }
  );
  if (!updated) return res.status(409).json({ message: 'Order was changed by another request. Refresh and try again.' });
  res.json(updated);
}));
export default router;
