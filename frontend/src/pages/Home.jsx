import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLoader, FiAlertCircle, FiCheck, FiMapPin, FiCalendar, FiUsers, FiStar, FiShield, FiClock, FiHeart } from 'react-icons/fi';
import { TbBeach, TbMountain, TbBuildingCommunity } from 'react-icons/tb';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import PropertyCard from '../components/PropertyCard';
import { propertyAPI, testAPI } from '../services/api';
import SearchBar from '../components/SearchBar';
import TestimonialCard from '../components/TestimonialCard';
import StatsCounter from '../components/StatsCounter';

const Home = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [activeCategory, setActiveCategory] = useState('all');
  const [stats, setStats] = useState({
    properties: 0,
    happyGuests: 0,
    locations: 0,
    ratings: 0
  });
  const heroRef = useRef(null);

  const categories = [
    { id: 'all', name: 'All Properties', icon: '🏠', color: 'bg-blue-100' },
    { id: 'beach', name: 'Beachfront', icon: '🏖️', color: 'bg-teal-100' },
    { id: 'mountain', name: 'Mountain View', icon: '⛰️', color: 'bg-green-100' },
    { id: 'city', name: 'City Center', icon: '🏙️', color: 'bg-purple-100' },
    { id: 'luxury', name: 'Luxury Villas', icon: '🌟', color: 'bg-yellow-100' },
    { id: 'budget', name: 'Budget Stays', icon: '💰', color: 'bg-orange-100' }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      location: 'London, UK',
      rating: 5,
      text: 'ShortStay made our Sri Lanka trip unforgettable! The villa in Galle was even better than the pictures.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
      date: 'March 2025'
    },
    {
      id: 2,
      name: 'David Chen',
      location: 'Singapore',
      rating: 4.8,
      text: 'As a frequent traveler, I appreciate the verification process. Felt safe and secure throughout my stay.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      date: 'February 2025'
    },
    {
      id: 3,
      name: 'Maria Garcia',
      location: 'Madrid, Spain',
      rating: 4.9,
      text: 'The local hosts were incredibly welcoming. Perfect balance of privacy and authentic experiences.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
      date: 'January 2025'
    }
  ];

  const popularDestinations = [
    {
      id: 1,
      name: 'Galle',
      image: 'https://images.unsplash.com/photo-1564574662336-88c9f5a6c8d8',
      properties: 42
    },
    {
      id: 2,
      name: 'Colombo',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada',
      properties: 89
    },
    {
      id: 3,
      name: 'Kandy',
      image: 'https://images.unsplash.com/photo-1593693399746-69f2065c0e87',
      properties: 31
    },
    {
      id: 4,
      name: 'Mirissa',
      image: 'https://images.unsplash.com/photo-1573843989-c9d5a5f8a4a9',
      properties: 27
    }
  ];

  useEffect(() => {
    checkApiHealth();
    // Simulate stats loading
    setTimeout(() => {
      setStats({
        properties: 1250,
        happyGuests: 8400,
        locations: 45,
        ratings: 4.8
      });
    }, 2000);
  }, []);

  const checkApiHealth = async () => {
    try {
      setApiStatus('checking');
      const healthRes = await testAPI.getServerStatus();
      console.log('API Health:', healthRes.data);
      setApiStatus('healthy');
      fetchFeaturedProperties();
    } catch (healthError) {
      console.error('API Health Check Failed:', healthError);
      setApiStatus('unhealthy');
      setError('Backend API is not responding. Please make sure the backend server is running on http://localhost:5000');
      setLoading(false);
    }
  };

  const fetchFeaturedProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching featured properties...');
      const response = await propertyAPI.getAll({
        limit: 6,
        verified_badge: true,
      });

      console.log('Properties response:', response.data);
      setFeaturedProperties(response.data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(`Failed to load properties: ${error.message}`);

      // Set mock data for development/fallback
      setFeaturedProperties([
        {
          id: 1,
          title: 'Luxury Beachfront Villa in Galle',
          description: 'Beautiful villa with panoramic ocean view, private pool, and modern amenities',
          location: 'Galle Fort, Southern Province',
          price_per_night: 45000,
          bedrooms: 4,
          max_guests: 8,
          images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227'],
          User: { name: 'John Silva', profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' },
          verified_badge: true,
          averageRating: 4.8,
          category: 'beach',
          amenities: ['Pool', 'WiFi', 'AC', 'Kitchen', 'Parking']
        },
        {
          id: 2,
          title: 'Modern Apartment in Colombo City Center',
          description: 'Stylish apartment with city views, walking distance to restaurants and shopping',
          location: 'Colombo 07, Western Province',
          price_per_night: 18000,
          bedrooms: 2,
          max_guests: 4,
          images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'],
          User: { name: 'Sarah Perera', profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786' },
          verified_badge: true,
          averageRating: 4.6,
          category: 'city',
          amenities: ['WiFi', 'AC', 'Gym', 'Concierge']
        },
        {
          id: 3,
          title: 'Eco-Friendly Tree House in Ella',
          description: 'Unique tree house experience with mountain views and sustainable design',
          location: 'Ella, Uva Province',
          price_per_night: 22000,
          bedrooms: 1,
          max_guests: 2,
          images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'],
          User: { name: 'Raj Fernando', profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' },
          verified_badge: true,
          averageRating: 4.9,
          category: 'mountain',
          amenities: ['WiFi', 'Breakfast', 'Garden', 'Yoga Deck']
        },
        {
          id: 4,
          title: 'Heritage Boutique Hotel in Kandy',
          description: 'Restored colonial-era property with traditional Sri Lankan architecture',
          location: 'Kandy, Central Province',
          price_per_night: 32000,
          bedrooms: 3,
          max_guests: 6,
          images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'],
          User: { name: 'Ananda Rajapakse', profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' },
          verified_badge: true,
          averageRating: 4.7,
          category: 'luxury',
          amenities: ['Pool', 'Spa', 'Restaurant', 'WiFi']
        },
        {
          id: 5,
          title: 'Cozy Beach Hut in Unawatuna',
          description: 'Simple and charming beach hut steps away from the golden sands',
          location: 'Unawatuna, Southern Province',
          price_per_night: 8000,
          bedrooms: 1,
          max_guests: 2,
          images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5'],
          User: { name: 'Priya De Silva', profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2' },
          verified_badge: true,
          averageRating: 4.4,
          category: 'budget',
          amenities: ['WiFi', 'Beach Access', 'Kitchenette']
        },
        {
          id: 6,
          title: 'Hillside Villa with Infinity Pool',
          description: 'Modern villa with stunning valley views and infinity pool',
          location: 'Nuwara Eliya, Central Province',
          price_per_night: 38000,
          bedrooms: 3,
          max_guests: 6,
          images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'],
          User: { name: 'Kamal Ranatunga', profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' },
          verified_badge: true,
          averageRating: 4.9,
          category: 'luxury',
          amenities: ['Infinity Pool', 'Fireplace', 'WiFi', 'BBQ Area']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const retryFetch = () => {
    checkApiHealth();
  };

  const filteredProperties = activeCategory === 'all'
    ? featuredProperties
    : featuredProperties.filter(property => property.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Section with Background */}
      <div
        ref={heroRef}
        className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-48">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Amazing
              <span className="text-accent-400 block">Short-Term Stays</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-200 leading-relaxed">
              Experience authentic Sri Lankan hospitality in verified accommodations.
              From beachfront villas to mountain retreats, find your perfect getaway.
            </p>

            {/* Search Bar */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
              <SearchBar />
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <StatsCounter
                value={stats.properties}
                label="Properties"
                icon={<TbBuildingCommunity />}
                duration={2}
              />
              <StatsCounter
                value={stats.happyGuests}
                label="Happy Guests"
                icon={<FiUsers />}
                duration={2}
              />
              <StatsCounter
                value={stats.locations}
                label="Locations"
                icon={<FiMapPin />}
                duration={2}
              />
              <StatsCounter
                value={stats.ratings}
                label="Average Rating"
                icon={<FiStar />}
                suffix="/5"
                duration={2}
              />
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path className="fill-gray-50 dark:fill-gray-950 transition-colors duration-300" fillOpacity="1" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,128C672,107,768,117,864,138.7C960,160,1056,192,1152,192C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      <div className="relative -mt-32 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* API Status Indicator */}
        {apiStatus !== 'healthy' && (
          <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-500 rounded-r-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <FiAlertCircle className="text-yellow-600 dark:text-yellow-500" size={24} />
                </div>
                <div>
                  <p className="font-bold text-yellow-800 dark:text-yellow-400 text-lg">API Connection Issue</p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    {apiStatus === 'checking'
                      ? 'Checking backend connection...'
                      : error || 'Cannot connect to backend server'}
                  </p>
                </div>
              </div>
              <button
                onClick={retryFetch}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Categories */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Explore by Category</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Find the perfect stay that matches your travel style</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`p-4 rounded-2xl transition-all duration-300 ${activeCategory === category.id
                  ? 'bg-primary-600 text-white shadow-lg transform -translate-y-1'
                  : `${category.color} dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:shadow-md`
                  }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-medium text-sm">{category.name}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Properties */}
        <section className="mb-20">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Featured Properties</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Curated selection of verified accommodations</p>
            </div>
            <Link
              to="/properties"
              className="hidden md:flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold"
            >
              <span>View All Properties</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-96">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <FiLoader className="w-8 h-8 text-primary-600 animate-pulse" />
                </div>
              </div>
              <span className="mt-6 text-gray-600 text-lg">Loading amazing properties...</span>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-3xl shadow-sm border border-transparent dark:border-gray-800">
              <div className="text-7xl mb-6">🏠</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">No properties found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                We couldn't find any properties matching your criteria. Try changing your filters or check back later.
              </p>
              <button
                onClick={retryFetch}
                className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl"
              >
                Refresh Properties
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 md:p-12 shadow-lg">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">How ShortStay Works</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Three simple steps to your perfect stay</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-300 to-primary-100 -z-10" />

              <div className="relative group">
                <div className="relative z-10 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 border border-transparent dark:border-gray-800">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">Discover & Search</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                    Browse through hundreds of verified properties. Use our smart filters to find exactly what you're looking for.
                  </p>
                  <div className="flex justify-center">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <FiMapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="relative z-10 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 border border-transparent dark:border-gray-800">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">Book Securely</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                    Reserve your stay with our secure payment system. Get instant confirmation and detailed booking information.
                  </p>
                  <div className="flex justify-center">
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <FiCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="relative z-10 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 border border-transparent dark:border-gray-800">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">Enjoy Your Stay</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                    Experience authentic Sri Lankan hospitality. Our support team is available 24/7 for any assistance.
                  </p>
                  <div className="flex justify-center">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                      <FiHeart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Popular Destinations</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Discover the most sought-after locations in Sri Lanka</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDestinations.map((destination) => (
              <div
                key={destination.id}
                onClick={() => navigate(`/properties?location=${destination.name}`)}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
              >
                <div className="aspect-w-16 aspect-h-12">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{destination.name}</h3>
                    <p className="text-gray-200 flex items-center">
                      <FiMapPin className="mr-2" />
                      {destination.properties} properties
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-primary-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">What Our Guests Say</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Real experiences from our community of travelers</p>
          </div>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
            className="pb-12"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <TestimonialCard testimonial={testimonial} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* Why Choose ShortStay */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-primary-900 to-primary-700 rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 lg:p-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Why Choose <span className="text-accent-400">ShortStay</span>?
                </h2>
                <p className="text-primary-100 mb-10 text-lg">
                  We're committed to providing the best short-term accommodation experience in Sri Lanka
                </p>

                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-accent-500/20 rounded-xl">
                        <FiShield className="w-6 h-6 text-accent-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">Verified Properties</h4>
                      <p className="text-primary-200">Every property undergoes thorough verification including field inspections.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-accent-500/20 rounded-xl">
                        <FiClock className="w-6 h-6 text-accent-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">24/7 Support</h4>
                      <p className="text-primary-200">Round-the-clock customer support for guests and hosts.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-accent-500/20 rounded-xl">
                        <FiCheck className="w-6 h-6 text-accent-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">Secure Payments</h4>
                      <p className="text-primary-200">Your payments are protected with bank-level security.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-accent-500/20 rounded-xl">
                        <FiStar className="w-6 h-6 text-accent-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">Local Experience</h4>
                      <p className="text-primary-200">Connect with local hosts for authentic Sri Lankan experiences.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[400px] lg:min-h-[500px]">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945"
                  alt="Luxury Villa"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <div className="bg-gradient-to-r from-accent-500 to-accent-600 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Find Your Perfect Stay?
            </h2>
            <p className="text-accent-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of happy travelers who have discovered amazing accommodations through ShortStay.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/properties">
                <button className="px-8 py-4 bg-white text-accent-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl">
                  Start Exploring Properties
                </button>
              </Link>
              <Link to="/register">
                <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all">
                  Become a Host
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;