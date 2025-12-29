const { Review, Booking, Property, User } = require('../models');

const createReview = async (req, res) => {
  try {
    const { property_id, booking_id, rating, comment } = req.body;

    // Check if booking exists and belongs to user
    const booking = await Booking.findOne({
      where: {
        id: booking_id,
        guest_id: req.user.id,
        property_id,
        status: 'completed'
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not completed' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      where: { booking_id, user_id: req.user.id }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this booking' });
    }

    const review = await Review.create({
      property_id,
      user_id: req.user.id,
      booking_id,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Error in createReview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { property_id: req.params.propertyId },
      include: [
        {
          model: User,
          as: 'user',  // ✅ ADD THIS - must match the alias in models/index.js
          attributes: ['id', 'name', 'profile_image']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Error in getPropertyReviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const updateReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { rating, comment } = req.body;
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    await review.save();

    res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Error in updateReview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await review.destroy();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteReview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createReview,
  getPropertyReviews,
  updateReview,
  deleteReview
};