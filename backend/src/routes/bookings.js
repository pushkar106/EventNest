const express = require('express');
const router = express.Router();
const { createBooking, confirmBooking, getMyBookings, getBookingById, cancelBooking } = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBookingById);
router.post('/:id/confirm', confirmBooking);
router.post('/:id/cancel', cancelBooking);

module.exports = router;
