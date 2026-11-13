import { Router } from 'express';
import Product from '../models/Product.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import asyncRoute from '../middleware/asyncRoute.js';
const router = Router();
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const editableFields = ['name','category','description','price','oldPrice','unit','stock','image','featured'];
const productInput = body => Object.fromEntries(editableFields.filter(key => body?.[key] !== undefined).map(key => [key, body[key]]));
router.get('/', asyncRoute(async (req, res) => {
  const filter = {};
  if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
  if (req.query.search) filter.name = { $regex: escapeRegex(String(req.query.search).slice(0, 100)), $options: 'i' };
  res.json(await Product.find(filter).sort({ createdAt: -1 }));
}));
router.get('/:id', asyncRoute(async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Product not found.' });
  res.json(item);
}));
router.post('/', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  try { res.status(201).json(await Product.create(productInput(req.body))); }
  catch (e) { if (e.name === 'ValidationError' || e.name === 'CastError') return res.status(400).json({ message: e.message }); throw e; }
}));
router.put('/:id', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  try {
    const item = await Product.findByIdAndUpdate(req.params.id, productInput(req.body), { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Product not found.' });
    res.json(item);
  } catch (e) { if (e.name === 'ValidationError' || e.name === 'CastError') return res.status(400).json({ message: e.message }); throw e; }
}));
router.delete('/:id', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const item = await Product.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Product not found.' });
  res.json({ message: 'Product deleted.' });
}));
export default router;
