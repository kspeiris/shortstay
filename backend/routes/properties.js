const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');

// Import ALL controller functions
const propertyController = require('../controllers/propertyController');

// Public routes
router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);

// Protected routes
router.post(
  '/',
  protect,
  authorize('host', 'admin'),
  upload.array('images', 10),
  propertyController.createProperty
);

router.get('/my/properties', protect, authorize('host', 'admin'), propertyController.getMyProperties);
router.put('/:id', protect, upload.array('images', 10), propertyController.updateProperty);
router.delete('/:id', protect, propertyController.deleteProperty);

module.exports = router;