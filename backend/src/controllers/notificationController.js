const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/response');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    return sendSuccess(res, { notifications, unreadCount }, 'Notifications');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const markRead = async (req, res) => {
  try {
    if (req.params.id === 'all') {
      await Notification.updateMany({ user: req.user._id }, { isRead: true });
    } else {
      await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
    }
    return sendSuccess(res, null, 'Marked as read');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = { getNotifications, markRead };
