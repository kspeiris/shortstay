import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyAPI, bookingAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/format';
import {
  FiHome,
  FiCalendar,
  FiDollarSign,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiUsers,
  FiStar,
  FiTrendingUp,
  FiEye,
  FiMoreVertical,
  FiChevronRight,
  FiRefreshCw,
  FiMessageSquare,
  FiActivity,
  FiCreditCard,
  FiDownload
} from 'react-icons/fi';
import { TbBuilding, TbBed, TbCalendarStats } from 'react-icons/tb';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HostDashboard = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingBookings: 0,
    occupancyRate: 0,
    averageRating: 4.8
  });

  const fetchHostData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching host data...');

      // Fetch properties
      let propertiesData = [];
      try {
        const propertiesRes = await propertyAPI.getMyProperties();
        propertiesData = propertiesRes.data.properties || [];
        console.log(`✅ Loaded ${propertiesData.length} properties`);
      } catch (propError) {
        console.error('❌ Properties fetch error:', propError);
        propertiesData = [];
        if (propError.response?.status !== 404) {
          toast.error('Failed to load properties');
        }
      }

      // Fetch bookings
      let bookingsData = [];
      try {
        const bookingsRes = await bookingAPI.getHostBookings();
        bookingsData = bookingsRes.data.bookings || [];
        console.log(`✅ Loaded ${bookingsData.length} bookings`);
      } catch (bookError) {
        console.error('❌ Bookings fetch error:', bookError);
        bookingsData = [];
        if (bookError.response?.status !== 404) {
          toast.error('Failed to load bookings');
        }
      }

      setProperties(propertiesData);
      setBookings(bookingsData);

      // Calculate stats
      const confirmedBookings = bookingsData.filter(b => b.status === 'confirmed' || b.status === 'completed');
      const totalRevenue = confirmedBookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
      const pendingBookings = bookingsData.filter(b => b.status === 'pending').length;
      const occupancyRate = propertiesData.length > 0 ? Math.min(85, Math.floor(Math.random() * 30) + 70) : 0;

      setStats({
        totalRevenue,
        pendingBookings,
        occupancyRate,
        averageRating: 4.8
      });

    } catch (error) {
      console.error('❌ Fatal error in fetchHostData:', error);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Failed to load host data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHostData();
  }, [fetchHostData]);

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await propertyAPI.delete(propertyId);
        setProperties(properties.filter(p => p.id !== propertyId));
        toast.success('Property deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete property');
      }
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await bookingAPI.updateStatus(bookingId, status);
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status } : b
      ));
      toast.success(`Booking ${status} successfully`);

      // Update stats
      if (status === 'confirmed') {
        setStats(prev => ({
          ...prev,
          pendingBookings: prev.pendingBookings - 1
        }));
      }
    } catch (error) {
      console.error('Update booking status error:', error);
      toast.error(error.response?.data?.message || 'Failed to update booking status');
    }
  };

  const calculateEarnings = () => {
    return bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
  };

  const monthlyRevenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 62000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 70000 },
  ];

  const recentActivities = [
    { id: 1, type: 'booking', message: 'New booking request for Beach Villa', time: '2 hours ago' },
    { id: 2, type: 'review', message: 'New 5-star review received', time: '1 day ago' },
    { id: 3, type: 'payment', message: 'Payment received for booking #3421', time: '2 days ago' },
    { id: 4, type: 'booking', message: 'Booking confirmed for Mountain Cabin', time: '3 days ago' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <FiHome className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading your host dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Error Loading Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <button
                onClick={fetchHostData}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                <FiRefreshCw className="inline mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 dark:from-blue-950 dark:via-blue-900 dark:to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Host Dashboard</h1>
              <p className="text-blue-200">Manage your properties, bookings, and earnings</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/properties/add')}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <FiPlus className="w-5 h-5" />
                Add Property
              </button>
              <button
                onClick={fetchHostData}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <FiRefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total Properties</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{properties.length}</p>
                <p className="text-sm text-green-600 mt-1">+2 this month</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <TbBuilding className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-green-600 mt-1">+12% from last month</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FiCreditCard className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Occupancy Rate</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.occupancyRate}%</p>
                <p className="text-sm text-blue-600 mt-1">Industry average: 65%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiTrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageRating}</p>
                  <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                </div>
                <p className="text-sm text-gray-600 mt-1">Across all properties</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <FiStar className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg mb-8 border border-gray-100 dark:border-gray-800">
          <div className="flex overflow-x-auto border-b border-gray-100">
            {['overview', 'properties', 'bookings', 'earnings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-medium text-center transition-all whitespace-nowrap ${activeTab === tab
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <>
              {/* Revenue Chart */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
                    <p className="text-gray-600 dark:text-gray-400">Monthly earnings from your properties</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <FiDownload className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${formatCurrency(value)}`, 'Revenue']}
                        labelStyle={{ color: '#374151' }}
                      />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activities */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className={`p-2 rounded-lg ${activity.type === 'booking' ? 'bg-blue-100' :
                            activity.type === 'review' ? 'bg-yellow-100' :
                              'bg-green-100'
                          }`}>
                          {activity.type === 'booking' && <FiCalendar className="w-4 h-4 text-blue-600" />}
                          {activity.type === 'review' && <FiStar className="w-4 h-4 text-yellow-600" />}
                          {activity.type === 'payment' && <FiCreditCard className="w-4 h-4 text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{activity.message}</p>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => navigate('/properties/add')}
                      className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center group"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                        <FiPlus className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">Add Property</div>
                    </button>
                    <button
                      onClick={() => navigate('/host/bookings')}
                      className="p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-center group"
                    >
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                        <FiCalendar className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">View Bookings</div>
                    </button>
                    <button
                      onClick={() => navigate('/host/earnings')}
                      className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-center group"
                    >
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                        <FiDollarSign className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">View Earnings</div>
                    </button>
                    <button
                      onClick={() => navigate('/host/messages')}
                      className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-colors text-center group"
                    >
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-yellow-200 transition-colors">
                        <FiMessageSquare className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">Messages</div>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'properties' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">My Properties</h3>
                    <p className="text-gray-600 dark:text-gray-400">Manage all your listed properties</p>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {properties.length} {properties.length === 1 ? 'property' : 'properties'} listed
                  </div>
                </div>
              </div>

              {properties.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TbBuilding className="w-12 h-12 text-gray-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No properties yet</h4>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Start earning by adding your first property. List your space in just a few minutes.
                  </p>
                  <button
                    onClick={() => navigate('/properties/add')}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium"
                  >
                    <FiPlus className="inline mr-2" />
                    Add Your First Property
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {properties.map((property) => (
                    <div key={property.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <img
                          src={property.images?.[0] || 'https://images.unsplash.com/photo-1613977257363-707ba9348227'}
                          alt={property.title}
                          className="w-full lg:w-48 h-40 rounded-xl object-cover"
                        />

                        <div className="flex-1">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{property.title}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${property.status === 'active' ? 'bg-green-100 text-green-800' :
                                    property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                  }`}>
                                  {property.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-gray-600 mb-4">
                                <div className="flex items-center gap-2">
                                  <FiHome className="w-4 h-4" />
                                  <span>{property.bedrooms} beds</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <TbBed className="w-4 h-4" />
                                  <span>{property.bathrooms || 2} baths</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FiUsers className="w-4 h-4" />
                                  <span>{property.max_guests} guests</span>
                                </div>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400">{property.location}</p>
                            </div>

                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(property.price_per_night)}
                              </div>
                              <div className="text-gray-600 dark:text-gray-400">per night</div>
                              <div className="flex items-center justify-end gap-1 mt-2">
                                <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="font-medium">{property.averageRating || '4.5'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 mt-6">
                            <button
                              onClick={() => navigate(`/properties/${property.id}`)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <FiEye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => navigate(`/properties/${property.id}/edit`)}
                              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                            >
                              <FiEdit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => navigate(`/host/bookings?property=${property.id}`)}
                              className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
                            >
                              <FiCalendar className="w-4 h-4" />
                              Bookings
                            </button>
                            <button
                              onClick={() => handleDeleteProperty(property.id)}
                              className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Booking Requests</h3>
                    <p className="text-gray-600 dark:text-gray-400">Manage and respond to booking requests</p>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.pendingBookings} pending {stats.pendingBookings === 1 ? 'request' : 'requests'}
                  </div>
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCalendar className="w-12 h-12 text-gray-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No bookings yet</h4>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    When guests book your properties, their requests will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                  {booking.guest?.name || 'Guest'}
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status) === 'green' ? 'bg-green-100 text-green-800' :
                                    getStatusColor(booking.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                      getStatusColor(booking.status) === 'red' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                  }`}>
                                  {booking.status}
                                </span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400">{booking.property?.title}</p>
                            </div>

                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(booking.total_price)}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24))} nights
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">Check-in</div>
                              <div className="font-medium">{formatDate(booking.start_date)}</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">Check-out</div>
                              <div className="font-medium">{formatDate(booking.end_date)}</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <FiUsers className="w-4 h-4" />
                              <span>{booking.guests} guests</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiCalendar className="w-4 h-4" />
                              <span>Booked {formatDate(booking.created_at)}</span>
                            </div>
                            {booking.special_requests && (
                              <div className="w-full mt-2 p-3 bg-blue-50 rounded-lg">
                                <div className="text-sm text-blue-800 font-medium mb-1">Special Request:</div>
                                <div className="text-sm text-blue-700">{booking.special_requests}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {booking.status === 'pending' && (
                          <div className="flex flex-col gap-3">
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                              <FiCheck className="w-5 h-5" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2"
                            >
                              <FiX className="w-5 h-5" />
                              Decline
                            </button>
                            <button
                              onClick={() => navigate(`/host/messages?booking=${booking.id}`)}
                              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                              <FiMessageSquare className="w-4 h-4" />
                              Message Guest
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Earnings Overview</h3>
                  <p className="text-gray-600 dark:text-gray-400">Track your revenue and upcoming payouts</p>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium">
                  <FiDownload className="inline mr-2" />
                  Download Report
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6">
                  <div className="text-sm mb-2">Total Earnings</div>
                  <div className="text-3xl font-bold mb-2">{formatCurrency(stats.totalRevenue)}</div>
                  <div className="text-sm opacity-90">All time</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6">
                  <div className="text-sm mb-2">This Month</div>
                  <div className="text-3xl font-bold mb-2">{formatCurrency(stats.totalRevenue * 0.3)}</div>
                  <div className="text-sm opacity-90">+12% from last month</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6">
                  <div className="text-sm mb-2">Next Payout</div>
                  <div className="text-3xl font-bold mb-2">{formatCurrency(stats.totalRevenue * 0.15)}</div>
                  <div className="text-sm opacity-90">Processing in 3 days</div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-4">Recent Transactions</h4>
                {bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length > 0 ? (
                  <div className="space-y-3">
                    {bookings
                      .filter(b => b.status === 'confirmed' || b.status === 'completed')
                      .slice(0, 5)
                      .map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">Booking #{booking.id}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{booking.property?.title}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">{formatCurrency(booking.total_price)}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(booking.created_at)}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiCreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No transactions yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;