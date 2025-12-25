import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertyAPI, reviewAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { 
  FiStar, FiMapPin, FiUsers, FiHome, FiCheck, 
  FiWifi, FiCoffee, FiTv, FiWind, FiKey
} from 'react-icons/fi';
import BookingModal from '../components/BookingModal';
import ReviewModal from '../components/ReviewModal';
import { toast } from 'react-hot-toast';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const [propertyRes, reviewsRes] = await Promise.all([
        propertyAPI.getById(id),
        reviewAPI.getByProperty(id)
      ]);
      setProperty(propertyRes.data.property);
      setReviews(reviewsRes.data.reviews);
    } catch (error) {
      toast.error('Failed to load property details');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a property');
      navigate('/login');
      return;
    }
    setShowBookingModal(true);
  };

  const handleReviewSubmitted = () => {
    fetchPropertyDetails();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  const amenitiesIcons = {
    'WiFi': <FiWifi />,
    'Breakfast': <FiCoffee />,
    'TV': <FiTv />,
    'AC': <FiWind />,
    'Parking': <FiKey />,
  };

  return (
    <div className="page-container">
      {/* Image Gallery */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <div className="rounded-2xl overflow-hidden h-96">
              <img
                src={property.images[selectedImage] || 'https://via.placeholder.com/800x600'}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {property.images.slice(0, 4).map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`rounded-lg overflow-hidden h-32 ${
                  selectedImage === index ? 'ring-2 ring-primary-600' : ''
                }`}
              >
                <img
                  src={img}
                  alt={`${property.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Property Header */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <FiMapPin className="mr-2" />
                    {property.location}
                  </div>
                  {property.verified_badge && (
                    <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      <FiCheck className="mr-1" />
                      Verified Property
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">
                  {formatCurrency(property.price_per_night)}
                  <span className="text-sm text-gray-600"> / night</span>
                </div>
                <div className="flex items-center justify-end mt-1">
                  <FiStar className="text-yellow-400 fill-current mr-1" />
                  <span className="font-medium">{property.averageRating || 'New'}</span>
                  <span className="text-gray-600 ml-1">
                    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <FiHome className="text-gray-400" />
                <div>
                  <div className="font-medium">{property.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FiHome className="text-gray-400" />
                <div>
                  <div className="font-medium">{property.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FiUsers className="text-gray-400" />
                <div>
                  <div className="font-medium">{property.max_guests}</div>
                  <div className="text-sm text-gray-600">Max Guests</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FiHome className="text-gray-400" />
                <div>
                  <div className="font-medium">{property.property_type || 'Villa'}</div>
                  <div className="text-sm text-gray-600">Type</div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">About this property</h2>
            <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
          </div>

          {/* Amenities */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">What this place offers</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.amenities?.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {amenitiesIcons[amenity] || <FiCheck />}
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                Reviews ({reviews.length})
              </h2>
              {user && user.role === 'guest' && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="btn-secondary"
                >
                  Write a Review
                </button>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-0">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <img
                          src={review.User?.profile_image || 'https://via.placeholder.com/40'}
                          alt={review.User?.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="font-medium">{review.User?.name}</div>
                          <div className="text-sm text-gray-600">
                            {formatDate(review.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FiStar className="text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-primary-600">
                {formatCurrency(property.price_per_night)}
              </div>
              <div className="text-gray-600">per night</div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in</span>
                <span className="font-medium">2:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out</span>
                <span className="font-medium">11:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cancellation</span>
                <span className="font-medium text-green-600">Flexible</span>
              </div>
            </div>

            <button
              onClick={handleBookNow}
              className="btn-primary w-full py-3 text-lg font-medium"
            >
              Book Now
            </button>

            <div className="mt-6 text-center text-sm text-gray-600">
              You won't be charged yet
            </div>

            {/* Host Info */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="font-bold mb-4">Hosted by</h3>
              <div className="flex items-center">
                <img
                  src={property.User?.profile_image || 'https://via.placeholder.com/50'}
                  alt={property.User?.name}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div>
                  <div className="font-medium">{property.User?.name}</div>
                  <div className="text-sm text-gray-600">Host</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBookingModal && (
        <BookingModal
          property={property}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          propertyId={property.id}
          bookingId={null}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default PropertyDetails;