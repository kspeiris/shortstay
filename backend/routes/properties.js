const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');
const propertyController = require('../controllers/propertyController');

// ✅ DEBUG MIDDLEWARE - Add this to see which routes are being hit
router.use((req, res, next) => {
  console.log(`🔍 [PROPERTY ROUTE] ${req.method} ${req.path}`);
  next();
});

// ========================================
// PUBLIC ROUTES (no authentication needed)
// ========================================
router.get('/', propertyController.getAllProperties);

// ========================================
// PROTECTED ROUTES - SPECIFIC PATHS FIRST!
// ========================================
// ✅ CRITICAL: /my-properties MUST come BEFORE /:id
// Otherwise Express will match "my-properties" as an id parameter!
router.get(
  '/my-properties', 
  protect, 
  authorize('host', 'admin'), 
  propertyController.getMyProperties
);

// ========================================
// PROTECTED ROUTES - GENERIC :id LAST
// ========================================
// ✅ This catches /properties/:id where :id is an actual ID
router.get('/:id', propertyController.getPropertyById);

// ========================================
// CREATE, UPDATE, DELETE ROUTES
// ========================================
router.post(
  '/',
  protect,
  authorize('host', 'admin'),
  upload.array('images', 10),
  propertyController.createProperty
);

router.put(
  '/:id', 
  protect, 
  upload.array('images', 10), 
  propertyController.updateProperty
);

router.delete(
  '/:id', 
  protect, 
  propertyController.deleteProperty
);

module.exports = router;