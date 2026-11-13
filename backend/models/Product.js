import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, default: '', maxlength: 2000 },
  price: { type: Number, required: true, min: 0 },
  oldPrice: { type: Number, default: 0, min: 0 },
  unit: { type: String, default: 'kg', trim: true, maxlength: 30 },
  stock: { type: Number, default: 0, min: 0, validate: Number.isInteger },
  image: { type: String, default: '', maxlength: 2048 },
  featured: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('Product', productSchema);
