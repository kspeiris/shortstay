import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertyAPI, reviewAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import {
  FiStar, FiMapPin, FiUsers, FiHome, FiCheck,
  FiWifi, FiCoffee, FiTv, FiWind, FiKey,
  FiLoader, FiCalendar, FiClock, FiShield,
  FiMessageSquare, FiChevronLeft, FiChevronRight,
  FiHeart, FiShare2, FiAlertCircle, FiPhone,
  FiMail
} from 'react-icons/fi';
import { TbBed, TbBath, TbRuler } from 'react-icons/tb';
import { MdPool, MdLocalLaundryService, MdKitchen, MdPets } from 'react-icons/md';
import { GiFireplace, GiHotSurface } from 'react-icons/gi';
import BookingModal from '../components/BookingModal';
import ReviewModal from '../components/ReviewModal';
import { toast } from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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
      setIsFavorite(localStorage.getItem(`favorite_${id}`) === 'true');
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

  const toggleFavorite = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    localStorage.setItem(`favorite_${id}`, newFavoriteState);
    toast.success(newFavoriteState ? 'Added to favorites' : 'Removed from favorites');
  };

  const shareProperty = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `Check out ${property?.title} on ShortStay`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const amenitiesIcons = {
    'WiFi': <FiWifi className="w-5 h-5" />,
    'Breakfast': <FiCoffee className="w-5 h-5" />,
    'TV': <FiTv className="w-5 h-5" />,
    'AC': <FiWind className="w-5 h-5" />,
    'Parking': <FiKey className="w-5 h-5" />,
    'Pool': <MdPool className="w-5 h-5" />,
    'Kitchen': <MdKitchen className="w-5 h-5" />,
    'Laundry': <MdLocalLaundryService className="w-5 h-5" />,
    'Pet Friendly': <MdPets className="w-5 h-5" />,
    'Fireplace': <GiFireplace className="w-5 h-5" />,
    'Heating': <GiHotSurface className="w-5 h-5" />,
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const ratingCategories = [
    { label: 'Cleanliness', value: 4.8 },
    { label: 'Accuracy', value: 4.9 },
    { label: 'Communication', value: 4.7 },
    { label: 'Location', value: 4.8 },
    { label: 'Check-in', value: 4.9 },
    { label: 'Value', value: 4.6 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-900/30 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <FiLoader className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors">
        <FiAlertCircle className="w-20 h-20 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Property Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">The property you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/properties')}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
        >
          Browse Properties
        </button>
      </div>
    );
  }

  const propertyImages = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1613977257363-707ba9348227'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 group"
        >
          <FiChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Properties
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Image Gallery with Swiper */}
        <div className="mb-8">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <Swiper
              modules={[Navigation, Pagination, Thumbs]}
              spaceBetween={10}
              navigation
              pagination={{ clickable: true }}
              thumbs={{ swiper: thumbsSwiper }}
              className="h-[500px]"
            >
              {propertyImages.map((img, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-full">
                    <img
                      src={img}
                      alt={`${property.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {index + 1} / {propertyImages.length}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Action Buttons */}
            <div className="absolute top-6 right-6 flex space-x-3 z-10">
              <button
                onClick={toggleFavorite}
                className={`p-3 rounded-full backdrop-blur-sm transition-all ${isFavorite
                  ? 'bg-red-500/20 text-red-500'
                  : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
              >
                <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={shareProperty}
                className="p-3 rounded-full backdrop-blur-sm bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <FiShare2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          <Swiper
            modules={[Thumbs]}
            watchSlidesProgress
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            className="mt-4"
          >
            {propertyImages.map((img, index) => (
              <SwiperSlide key={index} className="cursor-pointer">
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Property Header */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6">
                <div className="mb-6 lg:mb-0">
                  <div className="flex items-center gap-3 mb-3">
                    {property.verified_badge && (
                      <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full text-sm font-medium">
                        <FiCheck className="w-4 h-4" />
                        Verified Property
                      </div>
                    )}
                    <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm font-medium">
                      <FiHome className="w-4 h-4" />
                      {property.property_type || 'Villa'}
                    </div>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    {property.title}
                  </h1>

                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FiMapPin className="w-5 h-5" />
                      <span className="font-medium">{property.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-bold dark:text-white">{calculateAverageRating()}</span>
                      <span className="text-gray-500 dark:text-gray-500">
                        ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600">
                    {formatCurrency(property.price_per_night)}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">per night</div>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors">
                  <TbBed className="w-8 h-8 text-blue-500 mb-2" />
                  <div className="text-2xl font-bold dark:text-white">{property.bedrooms}</div>
                  <div className="text-gray-600 dark:text-gray-400">Bedrooms</div>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors">
                  <TbBath className="w-8 h-8 text-blue-500 mb-2" />
                  <div className="text-2xl font-bold dark:text-white">{property.bathrooms || 2}</div>
                  <div className="text-gray-600 dark:text-gray-400">Bathrooms</div>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors">
                  <FiUsers className="w-8 h-8 text-blue-500 mb-2" />
                  <div className="text-2xl font-bold dark:text-white">{property.max_guests}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Guests</div>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors">
                  <TbRuler className="w-8 h-8 text-blue-500 mb-2" />
                  <div className="text-2xl font-bold dark:text-white">{property.size || 'N/A'}</div>
                  <div className="text-gray-600 dark:text-gray-400">Square Feet</div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg mb-8 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
              <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-800">
                {['overview', 'amenities', 'reviews', 'location'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 font-medium text-center transition-all ${activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this property</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                      {property.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 dark:text-white">Check-in & Check-out</h4>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors">
                          <div className="flex items-center gap-3">
                            <FiCalendar className="w-5 h-5 text-blue-500" />
                            <span className="dark:text-gray-300">Check-in</span>
                          </div>
                          <span className="font-semibold dark:text-white">2:00 PM</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors">
                          <div className="flex items-center gap-3">
                            <FiCalendar className="w-5 h-5 text-blue-500" />
                            <span className="dark:text-gray-300">Check-out</span>
                          </div>
                          <span className="font-semibold dark:text-white">11:00 AM</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 dark:text-white">Cancellation Policy</h4>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 transition-colors">
                          <div className="flex items-start gap-3">
                            <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-green-800 dark:text-green-300">Flexible</div>
                              <p className="text-green-700 dark:text-green-400 text-sm mt-1">
                                Free cancellation up to 24 hours before check-in
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'amenities' && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What this place offers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {property.amenities?.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                            {amenitiesIcons[amenity] || <FiCheck className="w-5 h-5" />}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Guest Reviews</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <FiStar className="w-8 h-8 text-yellow-400 fill-current mr-2" />
                            <span className="text-3xl font-bold dark:text-white">{calculateAverageRating()}</span>
                            <span className="text-gray-600 dark:text-gray-400 ml-2">({reviews.length} reviews)</span>
                          </div>
                        </div>
                      </div>

                      {user && user.role === 'guest' && (
                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium mt-4 md:mt-0"
                        >
                          <FiMessageSquare className="inline mr-2" />
                          Write a Review
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {ratingCategories.map((category) => (
                        <div key={category.label} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{category.label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(category.value / 5) * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-bold dark:text-white">{category.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl transition-colors">
                        <FiMessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No reviews yet</h4>
                        <p className="text-gray-600 dark:text-gray-400">Be the first to share your experience!</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <img
                                  src={review.User?.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}
                                  alt={review.User?.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                  <div className="font-bold text-gray-900 dark:text-white">{review.User?.name}</div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(review.created_at)}</div>
                                </div>
                              </div>
                              <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full transition-colors">
                                <FiStar className="w-4 h-4 fill-current mr-1" />
                                <span className="font-bold">{review.rating}</span>
                              </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'location' && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Location</h3>
                    <div className="space-y-6">
                      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl transition-colors">
                        <div className="flex items-start gap-4 mb-4">
                          <FiMapPin className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-1">Exact Location</h4>
                            <p className="text-gray-700 dark:text-gray-300">{property.location}</p>
                          </div>
                        </div>
                        {/* Map placeholder */}
                        <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-xl flex items-center justify-center transition-colors">
                          <div className="text-center">
                            <FiMapPin className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-400">Interactive map coming soon</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl transition-colors">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-4">Getting Around</h4>
                          <ul className="space-y-3">
                            <li className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Airport</span>
                              <span className="font-semibold dark:text-white">30 min drive</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">City Center</span>
                              <span className="font-semibold dark:text-white">15 min walk</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Beach</span>
                              <span className="font-semibold dark:text-white">5 min walk</span>
                            </li>
                          </ul>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl transition-colors">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-4">Nearby Attractions</h4>
                          <ul className="space-y-2">
                            <li className="text-gray-700 dark:text-gray-300">• Galle Fort - 2km</li>
                            <li className="text-gray-700 dark:text-gray-300">• Unawatuna Beach - 1km</li>
                            <li className="text-gray-700 dark:text-gray-300">• Japanese Peace Pagoda - 3km</li>
                            <li className="text-gray-700 dark:text-gray-300">• Turtle Hatchery - 4km</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 sticky top-8 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {formatCurrency(property.price_per_night)}
                </div>
                <div className="text-gray-600 dark:text-gray-400">per night</div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium dark:text-gray-100">{calculateAverageRating()}</span>
                  <span className="text-gray-500 dark:text-gray-400">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <FiShield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-blue-800 dark:text-blue-200">Book with confidence</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Secure payment, 24/7 support, and free cancellation
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <FiCalendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span>Check-in/out</span>
                    </div>
                    <span className="font-semibold dark:text-white">2 PM / 11 AM</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <FiUsers className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span>Max guests</span>
                    </div>
                    <span className="font-semibold dark:text-white">{property.max_guests}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <FiClock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span>Cancellation</span>
                    </div>
                    <span className="font-semibold text-green-600 dark:text-green-400">Flexible</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 mb-4"
              >
                Book Now
              </button>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
                You won't be charged yet
              </div>

              {/* Host Info */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                <h4 className="font-bold text-gray-900 dark:text-white mb-6">Meet your host</h4>
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors">
                  <img
                    src={property.host?.profile_image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}
                    alt={property.host?.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 dark:text-white">{property.host?.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Superhost • Joined 2022</div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="dark:text-gray-200">4.9</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiMessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="dark:text-gray-300">98% response rate</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button className="flex-1 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2">
                    <FiMessageSquare className="w-4 h-4" />
                    Message
                  </button>
                  <button className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                    <FiPhone className="w-4 h-4" />
                    Call
                  </button>
                </div>
              </div>

              {/* Safety Information */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Safety & Standards</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>Property inspected by ShortStay field inspectors</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>Smoke and carbon monoxide detectors</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>First aid kit available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        <div className="mt-16 py-16 bg-gray-50 dark:bg-gray-950 rounded-3xl transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Similar Properties</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Other stays you might like</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2">
                View all
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
            {/* Add similar properties carousel here */}
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors">
              <p className="text-gray-600 dark:text-gray-400">Similar properties will be shown here</p>
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
    </div>
  );
};

export default PropertyDetails;