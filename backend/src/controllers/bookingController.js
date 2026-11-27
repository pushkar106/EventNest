const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { confirmPaidBooking } = require('../services/bookingService');
const { sendSuccess, sendError } = require('../utils/response');

const createBooking = async (req, res) => {
  try {
    const { eventId, ticketTypeId, quantity } = req.body;
    const qty = Number(quantity);
    if (!eventId || !ticketTypeId || !Number.isInteger(qty) || qty < 1) {
      return sendError(res, 'eventId, ticketTypeId, and a valid positive quantity are required', 400);
    }
    const event = await Event.findById(eventId);
    if (!event || event.status !== 'PUBLISHED') return sendError(res, 'Event not available for booking', 400);
    const ticketType = event.ticketTypes.id(ticketTypeId);
    if (!ticketType || !ticketType.isActive) return sendError(res, 'Ticket type not found or unavailable', 404);
    const available = ticketType.totalCapacity - ticketType.soldCount;
    if (qty > available) return sendError(res, `Only ${available} tickets remaining for this type`, 400);
    if (qty > ticketType.maxPerBooking) return sendError(res, `Maximum ${ticketType.maxPerBooking} tickets per booking`, 400);
    const subtotal = ticketType.price * qty;
    const taxAmount = subtotal > 0 ? Math.round(subtotal * 0.18 * 100) / 100 : 0;
    const convenienceFee = subtotal > 0 ? Math.round(subtotal * 0.02 * 100) / 100 : 0;
    const totalAmount = Math.round((subtotal + taxAmount + convenienceFee) * 100) / 100;
    const booking = await Booking.create({
      user: req.user._id, event: eventId, ticketTypeId, ticketTypeName: ticketType.name,
      quantity: qty, pricePerTicket: ticketType.price, subtotal, taxAmount, convenienceFee, totalAmount,
    });
    return sendSuccess(res, { booking }, 'Booking created. Proceed to payment.', 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const confirmBooking = async (req, res) => {
  try {
    const existing = await Booking.findById(req.params.id);
    if (!existing) return sendError(res, 'Booking not found', 404);
    if (existing.user.toString() !== req.user._id.toString()) return sendError(res, 'Access denied', 403);
    const booking = await confirmPaidBooking(req.params.id);
    return sendSuccess(res, { booking }, 'Booking confirmed! QR ticket generated.');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query).populate('event', 'title bannerImage startDate endDate venue category').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Booking.countDocuments(query),
    ]);
    return sendSuccess(res, { bookings, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }, 'My bookings');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event', 'title bannerImage startDate endDate venue category organizer');
    if (!booking) return sendError(res, 'Booking not found', 404);
    if (booking.user.toString() !== req.user._id.toString() && !['ADMIN','SUPER_ADMIN'].includes(req.user.role)) {
      return sendError(res, 'Access denied', 403);
    }
    return sendSuccess(res, { booking }, 'Booking details');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return sendError(res, 'Booking not found', 404);
    if (booking.user.toString() !== req.user._id.toString()) return sendError(res, 'Access denied', 403);
    if (booking.status === 'CANCELLED') return sendError(res, 'Already cancelled', 400);
    if (booking.isCheckedIn) return sendError(res, 'Cannot cancel a ticket that has already been checked in', 400);
    if (booking.status === 'CONFIRMED') {
      const event = await Event.findById(booking.event);
      if (event) {
        const ticketType = event.ticketTypes.id(booking.ticketTypeId);
        if (ticketType) {
          ticketType.soldCount = Math.max(0, ticketType.soldCount - booking.quantity);
        }
        event.bookingCount = Math.max(0, (event.bookingCount || 0) - 1);
        event.totalRevenue = Math.max(0, (event.totalRevenue || 0) - booking.totalAmount);
        if (event.status === 'SOLD_OUT') event.status = 'PUBLISHED';
        await event.save();
      }
    }
    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date();
    booking.cancelReason = req.body.reason || 'User cancelled';
    await booking.save();
    await Notification.create({ user: booking.user, title: 'Booking Cancelled', message: `Your booking ${booking.bookingId} has been cancelled.`, type: 'CANCELLATION', data: { bookingId: booking._id } });
    return sendSuccess(res, { booking }, 'Booking cancelled');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = { createBooking, confirmBooking, getMyBookings, getBookingById, cancelBooking };
