import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
dotenv.config();
if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
await mongoose.connect(process.env.MONGO_URI);
const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminEmail && adminPassword) {
  if (adminPassword.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters.');
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) await User.create({ name: 'Family Shop Admin', email: adminEmail, password: await bcrypt.hash(adminPassword, 12), role: 'admin' });
  else if (existing.role !== 'admin') throw new Error('ADMIN_EMAIL belongs to a non-admin account.');
} else {
  console.log('ADMIN_EMAIL/ADMIN_PASSWORD not set; leaving admin account unchanged.');
}
const products = [
  ['Miniket Rice','Grocery',78,'kg','https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',80],
  ['Fresh Potato','Vegetables',35,'kg','https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600',120],
  ['Red Tomato','Vegetables',55,'kg','https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600',60],
  ['Fresh Banana','Fruits',80,'dozen','https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600',40],
  ['Soybean Oil','Grocery',175,'liter','https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600',35],
  ['Fresh Milk','Dairy',90,'liter','https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600',50],
  ['Chicken','Fish & Meat',220,'kg','https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600',25],
  ['Orange Juice','Beverages',120,'bottle','https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600',30]
];
for (const [name,category,price,unit,image,stock] of products)
  await Product.updateOne({ name }, { $set: { name,category,price,unit,image,description:`Fresh quality ${name.toLowerCase()} from Family Shop.`,featured:true }, $setOnInsert: { stock } }, { upsert:true });
console.log('Seed complete. Any existing admin credentials were left unchanged.');
await mongoose.disconnect();
