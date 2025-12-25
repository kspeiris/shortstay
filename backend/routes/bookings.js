const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

router.post('/', protect, authorize('guest'), bookingController.createBooking);
router.get('/my', protect, bookingController.getMyBookings);
router.get('/host', protect, authorize('host', 'admin'), bookingController.getHostBookings);
router.put('/:id/status', protect, authorize('host', 'admin'), bookingController.updateBookingStatus);
router.put('/:id/cancel', protect, bookingController.cancelBooking);

module.exports = router;