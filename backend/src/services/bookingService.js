const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const Attendance = require('../models/Attendance');
const { generateQRCode } = require('../utils/generateQR');

const confirmPaidBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId).populate('event', 'title ticketTypes');
  if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
  if (booking.paymentStatus !== 'COMPLETED') {
    throw Object.assign(new Error('Payment not completed yet'), { statusCode: 400 });
  }
  if (booking.status === 'CONFIRMED' && booking.qrCodeUrl) return booking;

  const event = await Event.findById(booking.event._id || booking.event);
  if (event && booking.status !== 'CONFIRMED') {
    const ticketType = event.ticketTypes.id(booking.ticketTypeId);
    if (ticketType) {
      ticketType.soldCount = Math.min(ticketType.totalCapacity, ticketType.soldCount + booking.quantity);
      event.bookingCount = (event.bookingCount || 0) + 1;
      event.totalRevenue = (event.totalRevenue || 0) + booking.totalAmount;
      const anyRemaining = event.ticketTypes.some((t) => t.isActive && t.soldCount < t.totalCapacity);
      if (!anyRemaining && event.status === 'PUBLISHED') {
        event.status = 'SOLD_OUT';
      }
      await event.save();
    }
  }

  const eventId = booking.event._id || booking.event;
  const qrData = { bookingId: booking.bookingId, qrToken: booking.qrToken, eventId: String(eventId) };
  booking.qrCodeUrl = await generateQRCode(qrData);
  booking.status = 'CONFIRMED';
  await booking.save();

  await Attendance.findOneAndUpdate(
    { booking: booking._id },
    { booking: booking._id, user: booking.user, event: eventId },
    { upsert: true, new: true }
  );

  const eventTitle = booking.event?.title || 'the event';
  await Notification.create({
    user: booking.user,
    title: 'Booking Confirmed! 🎉',
    message: `Your booking for ${eventTitle} is confirmed. Your QR ticket is ready!`,
    type: 'BOOKING',
    data: { bookingId: booking._id },
  });

  return booking;
};

module.exports = { confirmPaidBooking };
