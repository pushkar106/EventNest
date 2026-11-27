const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, unique: true, sparse: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method: { type: String, enum: ['RAZORPAY','MOCK','CARD','UPI','NETBANKING'], default: 'MOCK' },
  status: { type: String, enum: ['PENDING','COMPLETED','FAILED','REFUNDED'], default: 'PENDING' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  isMock: { type: Boolean, default: false },
  metadata: { type: Object },
  paidAt: { type: Date },
}, { timestamps: true });

paymentSchema.index({ user: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
