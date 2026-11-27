const express = require('express');
const router = express.Router();
const { getDashboard, getUsers, toggleUserStatus, getAdminEvents, getAdminBookings, getAdminPayments } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));
router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/events', getAdminEvents);
router.get('/bookings', getAdminBookings);
router.get('/payments', getAdminPayments);

module.exports = router;
