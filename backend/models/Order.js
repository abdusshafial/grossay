import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String, price: Number, quantity: Number, image: String, unit: String
  }],
  customer: { name: String, phone: String, address: String, district: String, upazila: String },
  subtotal: { type: Number, required: true, min: 0 }, deliveryFee: { type: Number, required: true, min: 0 }, total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['Cash on Delivery'], default: 'Cash on Delivery' },
  paymentStatus: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
  status: { type: String, enum: ['Pending','Confirmed','Processing','Out for delivery','Delivered','Cancelled'], default: 'Pending' }
}, { timestamps: true });
export default mongoose.model('Order', orderSchema);
