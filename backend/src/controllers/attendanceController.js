const Attendance = require('../models/Attendance');
const Booking = require('../models/Booking');
const { sendSuccess, sendError } = require('../utils/response');

const getAttendees = async (req, res) => {
  try {
    const attendees = await Attendance.find({ event: req.params.id })
      .populate('user', 'fullName email mobile')
      .populate('booking', 'bookingId ticketTypeName quantity totalAmount paymentStatus status isCheckedIn checkedInAt')
      .sort({ createdAt: -1 });
    return sendSuccess(res, { attendees, total: attendees.length }, 'Attendees');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const verifyQR = async (req, res) => {
  try {
    let { qrToken, eventId } = req.body;
    if (!qrToken) return sendError(res, 'QR token required', 400);
    if (typeof qrToken === 'string' && qrToken.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(qrToken);
        qrToken = parsed.qrToken || qrToken;
      } catch {}
    }
    qrToken = String(qrToken).trim();
    const booking = await Booking.findOne({ qrToken })
      .populate('user', 'fullName email mobile')
      .populate('event', 'title startDate venue');
    if (!booking) return sendError(res, '❌ Invalid QR code - Ticket not found', 404);
    if (booking.status !== 'CONFIRMED' || booking.paymentStatus !== 'COMPLETED') return sendError(res, '❌ Booking not confirmed or payment not completed', 400);
    if (eventId && booking.event._id.toString() !== eventId) return sendError(res, '❌ QR code is for a different event', 400);
    if (booking.isCheckedIn) return sendError(res, `❌ Already checked in at ${new Date(booking.checkedInAt).toLocaleString()}`, 400);
    booking.isCheckedIn = true;
    booking.checkedInAt = new Date();
    await booking.save();
    await Attendance.findOneAndUpdate(
      { booking: booking._id },
      { booking: booking._id, user: booking.user._id, event: booking.event._id, status: 'PRESENT', checkedInAt: new Date(), checkedInBy: req.user._id, verificationMethod: 'QR' },
      { upsert: true, new: true }
    );
    return sendSuccess(res, {
      booking,
      attendee: { name: booking.user.fullName, email: booking.user.email, mobile: booking.user.mobile, ticketType: booking.ticketTypeName, quantity: booking.quantity, event: booking.event.title }
    }, '✅ Entry Verified Successfully!');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const manualCheckin = async (req, res) => {
  try {
    const { bookingId, eventId } = req.body;
    if (!bookingId) return sendError(res, 'Booking ID required', 400);
    const normalizedId = String(bookingId).trim().toUpperCase();
    const booking = await Booking.findOne({ bookingId: normalizedId })
      .populate('user', 'fullName email mobile')
      .populate('event', 'title');
    if (!booking) return sendError(res, '❌ Booking not found', 404);
    if (booking.status !== 'CONFIRMED' || booking.paymentStatus !== 'COMPLETED') return sendError(res, '❌ Booking not confirmed or payment pending', 400);
    if (eventId && booking.event._id.toString() !== eventId) return sendError(res, '❌ Booking belongs to a different event', 400);
    if (booking.isCheckedIn) return sendError(res, `❌ Already checked in at ${new Date(booking.checkedInAt).toLocaleString()}`, 400);
    booking.isCheckedIn = true;
    booking.checkedInAt = new Date();
    await booking.save();
    await Attendance.findOneAndUpdate(
      { booking: booking._id },
      { booking: booking._id, user: booking.user._id, event: booking.event._id, status: 'PRESENT', checkedInAt: new Date(), checkedInBy: req.user._id, verificationMethod: 'MANUAL' },
      { upsert: true, new: true }
    );
    return sendSuccess(res, {
      booking,
      attendee: { name: booking.user.fullName, email: booking.user.email, ticketType: booking.ticketTypeName, quantity: booking.quantity, event: booking.event.title }
    }, '✅ Manual check-in successful!');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['PRESENT', 'ABSENT', 'NOT_YET'].includes(status)) {
      return sendError(res, 'Invalid attendance status', 400);
    }
    const update = { status };
    if (status === 'PRESENT') {
      update.checkedInAt = new Date();
      update.checkedInBy = req.user._id;
      update.verificationMethod = 'MANUAL';
    }
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!attendance) return sendError(res, 'Attendance record not found', 404);
    await Booking.findByIdAndUpdate(attendance.booking, {
      isCheckedIn: status === 'PRESENT',
      checkedInAt: status === 'PRESENT' ? update.checkedInAt : null,
    });
    return sendSuccess(res, { attendance }, 'Status updated');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = { getAttendees, verifyQR, manualCheckin, updateStatus };
