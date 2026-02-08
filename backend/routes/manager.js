const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const managerController = require('../controllers/managerController');

// --- Payment Manager Routes ---
router.get(
    '/payments',
    protect,
    authorize('payment_manager', 'admin'),
    managerController.getPayments
);

router.put(
    '/payments/:id',
    protect,
    authorize('payment_manager', 'admin'),
    managerController.updatePaymentStatus
);

// --- Field Inspector Routes ---
router.get(
    '/inspections',
    protect,
    authorize('field_inspector', 'admin'),
    managerController.getPendingInspections
);

router.put(
    '/properties/:id/verify',
    protect,
    authorize('field_inspector', 'admin'),
    managerController.verifyProperty
);

module.exports = router;
