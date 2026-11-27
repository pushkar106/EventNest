const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String, unique: true,
    default: () => 'BK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase()
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticketTypeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  ticketTypeName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  pricePerTicket: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  convenienceFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING','CONFIRMED','CANCELLED','REFUNDED'], default: 'PENDING' },
  paymentStatus: { type: String, enum: ['PENDING','COMPLETED','FAILED','REFUNDED'], default: 'PENDING' },
  qrToken: { type: String, unique: true, default: () => require('uuid').v4() },
  qrCodeUrl: { type: String },
  isCheckedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date },
  cancelledAt: { type: Date },
  cancelReason: { type: String },
}, { timestamps: true });

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ event: 1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ qrToken: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
