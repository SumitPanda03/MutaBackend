const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ 
    name: String, 
    price: Number, 
    quantity: Number 
  }],
  totalAmount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'completed', 'cancelled'] },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);