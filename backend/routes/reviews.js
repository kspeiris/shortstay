const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

router.post('/', protect, reviewController.createReview);
router.get('/property/:propertyId', reviewController.getPropertyReviews);
router.put('/:id', protect, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;