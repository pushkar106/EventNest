const express = require('express');
const router = express.Router();
const { getEvents, getFeaturedEvents, getEventById, createEvent, updateEvent, deleteEvent, publishEvent, featureEvent } = require('../controllers/eventController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/:id', getEventById);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), createEvent);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), updateEvent);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), deleteEvent);
router.patch('/:id/publish', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), publishEvent);
router.patch('/:id/feature', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), featureEvent);

module.exports = router;
