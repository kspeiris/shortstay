const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

// ✅ ADD THIS DEBUG MIDDLEWARE
router.use((req, res, next) => {
  console.log(`🔍 [BOOKING ROUTE] ${req.method} ${req.path}`);
  console.log(`🔍 Full URL: ${req.originalUrl}`);
  next();
});

// Rest of your routes...
// ========================================
// PROTECTED ROUTES - SPECIFIC PATHS FIRST
// ========================================

// ✅ Guest bookings - bookings made BY the current user
router.get(
  '/my-bookings',
  protect,
  bookingController.getMyBookings
);

// ✅ Host bookings - bookings FOR properties owned by current user
router.get(
  '/host-bookings',
  protect,
  authorize('host', 'admin'),
  bookingController.getHostBookings
);

// ✅ Bookings for a specific property
router.get(
  '/property/:propertyId',
  protect,
  bookingController.getPropertyBookings
);

// ========================================
// GENERIC :id ROUTES - LAST
// ========================================
router.get(
  '/:id',
  protect,
  bookingController.getById
);

// ========================================
// CREATE, UPDATE, DELETE
// ========================================
router.post(
  '/',
  protect,
  bookingController.createBooking
);

router.put(
  '/:id/cancel',
  protect,
  bookingController.cancelBooking
);

router.put(
  '/:id/status',
  protect,
  authorize('host', 'admin'),
  bookingController.updateStatus
);

module.exports = router;