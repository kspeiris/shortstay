import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/format';
import {
  FiCalendar,
  FiHome,
  FiCreditCard,
  FiStar,
  FiHeart,
  FiSettings,
  FiMapPin,
  FiChevronRight,
  FiLoader,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiTrendingUp
} from 'react-icons/fi';
import { TbBed, TbCalendarStats } from 'react-icons/tb';
import { toast } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching dashboard data...');
      const bookingsRes = await bookingAPI.getMyBookings();

      // Handle different possible response structures
      const bookingsData = bookingsRes.data?.bookings || bookingsRes.data || [];

      console.log('📦 Bookings data:', bookingsData);
      console.log('📊 Number of bookings:', bookingsData.length);

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);

      if (bookingsData.length === 0) {
        console.log('ℹ️ No bookings found');
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError('Failed to load bookings. Please try again.');
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking? There may be cancellation fees.')) {
      try {
        await bookingAPI.cancel(bookingId);
        setBookings(bookings.map(b =>
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        ));
        toast.success('Booking cancelled successfully');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        toast.error(error.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  const calculateTotalSpent = () => {
    return bookings.reduce((sum, b) => {
      const price = parseFloat(b.total_price) || 0;
      return sum + price;
    }, 0);
  };

  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'upcoming':
        return bookings.filter(b =>
          ['pending', 'confirmed'].includes(b.status) &&
          new Date(b.start_date) > new Date()
        );
      case 'completed':
        return bookings.filter(b =>
          b.status === 'completed' ||
          (b.status === 'confirmed' && new Date(b.end_date) < new Date())
        );
      case 'cancelled':
        return bookings.filter(b => b.status === 'cancelled');
      default:
        return bookings;
    }
  };

  const spendingData = [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 48000 },
    { month: 'Apr', amount: 62000 },
    { month: 'May', amount: 55000 },
    { month: 'Jun', amount: 70000 },
  ];

  const upcomingTrips = bookings.filter(b =>
    ['pending', 'confirmed'].includes(b.status) &&
    new Date(b.start_date) > new Date()
  ).slice(0, 2);

  const recentActivities = [
    { id: 1, type: 'booking', message: 'You booked Beach Villa in Galle', time: '2 days ago' },
    { id: 2, type: 'review', message: 'You reviewed Mountain Cabin', time: '1 week ago' },
    { id: 3, type: 'payment', message: 'Payment confirmed for booking #3421', time: '2 weeks ago' },
    { id: 4, type: 'booking', message: 'Booking cancelled for City Apartment', time: '3 weeks ago' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <FiLoader className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
              <p className="text-blue-200">Manage your bookings, trips, and preferences</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchData}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <FiRefreshCw className="w-5 h-5" />
                Refresh
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <FiSettings className="w-5 h-5" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16">
        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 transition-colors">
            <div className="flex items-start gap-4">
              <FiAlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-red-800 dark:text-red-400 mb-2">Failed to Load Data</div>
                <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
                <button
                  onClick={fetchData}
                  className="px-6 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total Trips</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{bookings.length}</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">All time</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <FiCalendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Upcoming Trips</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {bookings.filter(b =>
                    ['pending', 'confirmed'].includes(b.status) &&
                    new Date(b.start_date) > new Date()
                  ).length}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Next 30 days</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <FiHome className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(calculateTotalSpent())}
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">+12% this year</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <FiCreditCard className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Saved Properties</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">12</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Your favorites</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <FiHeart className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Spending Overview */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Spending Overview</h3>
                <p className="text-gray-600 dark:text-gray-400">Your travel expenses over time</p>
              </div>
              <select className="bg-transparent font-medium text-gray-900 dark:text-white outline-none">
                <option>Last 6 months</option>
                <option>Last year</option>
                <option>All time</option>
              </select>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${formatCurrency(value)}`, 'Spending']}
                    labelStyle={{ color: '#9ca3af' }}
                    contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Trips */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Trips</h3>
              <button
                onClick={() => navigate('/bookings')}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View all
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>

            {upcomingTrips.length === 0 ? (
              <div className="text-center py-8">
                <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No upcoming trips</p>
                <button
                  onClick={() => navigate('/properties')}
                  className="px-6 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  Book a Trip
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingTrips.map((booking) => (
                  <div key={booking.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{booking.property?.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <FiMapPin className="w-3 h-3" />
                          {booking.property?.location}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(booking.total_price)}
                      </div>
                      <button
                        onClick={() => navigate(`/bookings/${booking.id}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bookings Management */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Bookings</h3>
                <p className="text-gray-600 dark:text-gray-400">Manage all your trips and reservations</p>
              </div>

              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mt-4 md:mt-0">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'upcoming'
                    ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'completed'
                    ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setActiveTab('cancelled')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'cancelled'
                    ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  Cancelled
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'all'
                    ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  All
                </button>
              </div>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
                <FiCalendar className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No bookings yet</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Start exploring amazing properties across Sri Lanka. Your first adventure awaits!
              </p>
              <button
                onClick={() => navigate('/properties')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                Browse Properties
              </button>
            </div>
          ) : getFilteredBookings().length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">
                {activeTab === 'upcoming' && '📅'}
                {activeTab === 'completed' && '✅'}
                {activeTab === 'cancelled' && '❌'}
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No {activeTab} bookings
              </h4>
              <p className="text-gray-600 dark:text-gray-400">Try selecting a different filter</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {getFilteredBookings().map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <img
                      src={booking.property?.images?.[0] || 'https://images.unsplash.com/photo-1613977257363-707ba9348227'}
                      alt={booking.property?.title}
                      className="w-full lg:w-48 h-40 rounded-xl object-cover"
                    />

                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">{booking.property?.title}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${getStatusColor(booking.status) === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                              getStatusColor(booking.status) === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                getStatusColor(booking.status) === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                  'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                              }`}>
                              {booking.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-2">
                              <TbCalendarStats className="w-4 h-4" />
                              <span>{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiClock className="w-4 h-4" />
                              <span>{Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24))} nights</span>
                            </div>
                          </div>

                          <p className="text-gray-600 dark:text-gray-400">
                            <FiMapPin className="inline w-4 h-4 mr-1" />
                            {booking.property?.location}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(booking.total_price)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total amount</div>
                          <div className="flex items-center justify-end gap-1 mt-2">
                            <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-medium">{booking.property?.averageRating || '4.5'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-6">
                        <button
                          onClick={() => navigate(`/properties/${booking.property?.id || booking.property_id}`)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                          View Property
                        </button>
                        <button
                          onClick={() => navigate(`/bookings/${booking.id}`)}
                          className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2"
                        >
                          Booking Details
                        </button>
                        {booking.status === 'confirmed' && new Date(booking.start_date) > new Date() && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
                          >
                            Cancel Booking
                          </button>
                        )}
                        {booking.status === 'completed' && (
                          <button
                            onClick={() => navigate(`/properties/${booking.property_id}/review`)}
                            className="px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors flex items-center gap-2"
                          >
                            Write a Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/properties')}
            className="p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-900 border border-blue-100 dark:border-blue-900/30 rounded-2xl hover:shadow-lg transition-all text-left group"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <FiHome className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Browse Properties</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Find your next amazing stay</p>
          </button>

          <button
            onClick={() => navigate('/favorites')}
            className="p-6 bg-gradient-to-br from-red-50 to-white dark:from-red-900/10 dark:to-gray-900 border border-red-100 dark:border-red-900/30 rounded-2xl hover:shadow-lg transition-all text-left group"
          >
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
              <FiHeart className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Saved Properties</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">View your favorite stays</p>
          </button>

          <button
            onClick={() => navigate('/messages')}
            className="p-6 bg-gradient-to-br from-green-50 to-white dark:from-green-900/10 dark:to-gray-900 border border-green-100 dark:border-green-900/30 rounded-2xl hover:shadow-lg transition-all text-left group"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
              <FiCalendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Messages</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Chat with hosts</p>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="p-6 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-gray-900 border border-purple-100 dark:border-purple-900/30 rounded-2xl hover:shadow-lg transition-all text-left group"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
              <FiSettings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Account Settings</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your profile</p>
          </button>
        </div>
      </div>
    </div >
  );
};

export default Dashboard;