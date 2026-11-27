const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { confirmPaidBooking } = require('../services/bookingService');
const { sendSuccess, sendError } = require('../utils/response');
const crypto = require('crypto');

const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return sendError(res, 'Booking not found', 404);
    if (booking.user.toString() !== req.user._id.toString()) return sendError(res, 'Access denied', 403);
    if (booking.paymentStatus === 'COMPLETED') return sendError(res, 'Already paid', 400);

    const isMock = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('YOUR_KEY') || process.env.MOCK_PAYMENT === 'true';

    if (isMock) {
      const mockOrderId = 'MOCK_ORDER_' + Date.now();
      await Payment.findOneAndUpdate(
        { booking: booking._id },
        { paymentId: 'MOCK_PAY_' + Date.now(), booking: booking._id, user: req.user._id, event: booking.event, amount: booking.totalAmount, method: 'MOCK', status: 'PENDING', isMock: true, razorpayOrderId: mockOrderId },
        { upsert: true, new: true }
      );
      return sendSuccess(res, { orderId: mockOrderId, amount: booking.totalAmount, currency: 'INR', isMock: true, bookingId: booking._id, key: 'MOCK_MODE' }, 'Mock order created - Demo Payment Mode');
    }

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const order = await razorpay.orders.create({ amount: Math.round(booking.totalAmount * 100), currency: 'INR', receipt: booking.bookingId });
    await Payment.create({ paymentId: order.id, booking: booking._id, user: req.user._id, event: booking.event, amount: booking.totalAmount, method: 'RAZORPAY', status: 'PENDING', razorpayOrderId: order.id });
    return sendSuccess(res, { orderId: order.id, amount: booking.totalAmount, currency: 'INR', isMock: false, bookingId: booking._id, key: process.env.RAZORPAY_KEY_ID }, 'Order created');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return sendError(res, 'Missing Razorpay payment verification fields', 400);
    }
    if (!process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET.includes('YOUR_RAZORPAY')) {
      return sendError(res, 'Razorpay secret not configured on server', 503);
    }
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) return sendError(res, 'Payment record not found', 404);
    if (payment.user.toString() !== req.user._id.toString()) return sendError(res, 'Access denied', 403);
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    if (expectedSignature !== razorpay_signature) return sendError(res, 'Payment signature verification failed', 400);
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'COMPLETED';
    payment.paidAt = new Date();
    await payment.save();
    const booking = await Booking.findById(payment.booking);
    booking.paymentStatus = 'COMPLETED';
    await booking.save();
    const confirmed = await confirmPaidBooking(booking._id);
    return sendSuccess(res, { payment, booking: confirmed, bookingId: booking._id }, 'Payment verified successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const mockComplete = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return sendError(res, 'bookingId is required', 400);
    const booking = await Booking.findById(bookingId);
    if (!booking) return sendError(res, 'Booking not found', 404);
    if (booking.user.toString() !== req.user._id.toString()) return sendError(res, 'Access denied', 403);
    if (booking.status === 'CANCELLED') return sendError(res, 'Cannot pay for a cancelled booking', 400);
    const payment = await Payment.findOneAndUpdate(
      { booking: booking._id },
      {
        paymentId: 'MOCK_PAY_' + Date.now(),
        booking: booking._id,
        user: req.user._id,
        event: booking.event,
        amount: booking.totalAmount,
        method: 'MOCK',
        isMock: true,
        status: 'COMPLETED',
        paidAt: new Date(),
        razorpayPaymentId: 'MOCK_' + Date.now(),
      },
      { upsert: true, new: true }
    );
    booking.paymentStatus = 'COMPLETED';
    await booking.save();
    const confirmed = await confirmPaidBooking(booking._id);
    return sendSuccess(res, { booking: confirmed, payment }, '✅ Mock payment completed successfully!');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('event', 'title').populate('booking', 'bookingId')
      .sort({ createdAt: -1 });
    return sendSuccess(res, { payments }, 'Payment history');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = { createOrder, verifyPayment, mockComplete, getMyPayments };
