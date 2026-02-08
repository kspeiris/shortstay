import React, { useState } from 'react';
import { FiX, FiStar } from 'react-icons/fi';
import { reviewAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const ReviewModal = ({ propertyId, bookingId, isOpen, onClose, onReviewSubmitted }) => {
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewData.comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      await reviewAPI.create({
        property_id: propertyId,
        booking_id: bookingId,
        ...reviewData,
      });
      toast.success('Review submitted successfully!');
      onReviewSubmitted();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50 dark:opacity-70 dark:opacity-70" onClick={onClose}></div>
        
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full animate-slide-up border border-transparent dark:border-gray-800 transition-colors">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Write a Review</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Rating */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewData({...reviewData, rating: star})}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <FiStar
                          className={`w-8 h-8 ${
                            star <= reviewData.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    {reviewData.rating === 5 && 'Excellent'}
                    {reviewData.rating === 4 && 'Good'}
                    {reviewData.rating === 3 && 'Average'}
                    {reviewData.rating === 2 && 'Poor'}
                    {reviewData.rating === 1 && 'Terrible'}
                  </p>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Review</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                    className="input-field h-32"
                    placeholder="Share your experience with this property..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;