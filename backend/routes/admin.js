const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUserRole);
router.get('/properties/pending', adminController.getPendingProperties);
router.put('/properties/:id/status', adminController.updatePropertyStatus);
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/payments', adminController.getAllPayments);

module.exports = router;