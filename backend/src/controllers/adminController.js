const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const { sendSuccess, sendError } = require('../utils/response');

const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalEvents, publishedEvents, totalBookings, confirmedBookings, cancelledBookings, pendingPayments, revenueResult, upcomingEvents, checkedInCount, recentBookings] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'PUBLISHED' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'CONFIRMED' }),
      Booking.countDocuments({ status: 'CANCELLED' }),
      Payment.countDocuments({ status: 'PENDING' }),
      Payment.aggregate([{ $match: { status: 'COMPLETED' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Event.countDocuments({ status: 'PUBLISHED', startDate: { $gt: new Date() } }),
      Attendance.countDocuments({ status: 'PRESENT' }),
      Booking.find().populate('user', 'fullName email').populate('event', 'title').sort({ createdAt: -1 }).limit(5),
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const monthlyBookings = await Booking.aggregate([
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }, { $limit: 12 },
    ]);
    const categoryData = await Event.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    const revenueByMonth = await Payment.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, revenue: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }, { $limit: 12 },
    ]);

    return sendSuccess(res, {
      stats: { totalUsers, totalEvents, publishedEvents, upcomingEvents, totalBookings, confirmedBookings, cancelledBookings, totalRevenue, pendingPayments, totalAttendees: confirmedBookings, checkedInCount },
      charts: { monthlyBookings, categoryData, revenueByMonth },
      recentBookings,
    }, 'Dashboard data');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);
    return sendSuccess(res, { users, total, page: parseInt(page), pages: Math.max(1, Math.ceil(total / parseInt(limit))) }, 'Users');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'You cannot disable your own account', 400);
    }
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    return sendSuccess(res, { user }, `User ${user.isActive ? 'enabled' : 'disabled'}`);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getAdminEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [events, total] = await Promise.all([
      Event.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Event.countDocuments(query),
    ]);
    return sendSuccess(res, { events, total, page: parseInt(page), pages: Math.max(1, Math.ceil(total / parseInt(limit))) }, 'Admin events');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getAdminBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      const [matchingUsers, matchingEvents] = await Promise.all([
        User.find({ $or: [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }).select('_id'),
        Event.find({ title: { $regex: search, $options: 'i' } }).select('_id'),
      ]);
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { user: { $in: matchingUsers.map((u) => u._id) } },
        { event: { $in: matchingEvents.map((e) => e._id) } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query).populate('user', 'fullName email').populate('event', 'title').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Booking.countDocuments(query),
    ]);
    return sendSuccess(res, { bookings, total, page: parseInt(page), pages: Math.max(1, Math.ceil(total / parseInt(limit))) }, 'Admin bookings');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getAdminPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, method } = req.query;
    const query = {};
    if (status) query.status = status;
    if (method) query.method = method;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [payments, total] = await Promise.all([
      Payment.find(query).populate('user', 'fullName email').populate('event', 'title').populate('booking', 'bookingId').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Payment.countDocuments(query),
    ]);
    return sendSuccess(res, { payments, total, page: parseInt(page), pages: Math.max(1, Math.ceil(total / parseInt(limit))) }, 'Admin payments');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = { getDashboard, getUsers, toggleUserStatus, getAdminEvents, getAdminBookings, getAdminPayments };
