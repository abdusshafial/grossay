import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import asyncRoute from '../middleware/asyncRoute.js';
const router = Router();
const issue = user => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const safe = user => ({ id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role });

router.post('/register', asyncRoute(async (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = body.password;
    const phone = String(body.phone || '').trim();
    if (!name || name.length > 100 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254 || phone.length > 30 || typeof password !== 'string' || password.length < 8 || password.length > 128)
      return res.status(400).json({ message: 'Name, email and password (at least 8 characters) are required.' });
    if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already registered.' });
    const user = await User.create({ name, email, phone, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: issue(user), user: safe(user) });
  } catch (e) { if (e.name === 'ValidationError' || e.code === 11000) return res.status(400).json({ message: e.code === 11000 ? 'Email already registered.' : e.message }); throw e; }
}));
router.post('/login', asyncRoute(async (req, res) => {
  try {
    const body = req.body || {};
    const user = await User.findOne({ email: String(body.email || '').trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(typeof body.password === 'string' ? body.password : '', user.password)))
      return res.status(401).json({ message: 'Incorrect email or password.' });
    res.json({ token: issue(user), user: safe(user) });
  } catch (e) { throw e; }
}));
router.get('/me', requireAuth, (req, res) => res.json({ user: safe(req.user) }));
export default router;
