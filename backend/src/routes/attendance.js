const express = require('express');
const router = express.Router();
const { getAttendees, verifyQR, manualCheckin, updateStatus } = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));
router.get('/events/:id/attendees', getAttendees);
router.post('/verify-qr', verifyQR);
router.post('/manual-checkin', manualCheckin);
router.patch('/:id/status', updateStatus);

module.exports = router;
