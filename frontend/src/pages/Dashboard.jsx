import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/format';
import { FiCalendar, FiHome, FiCreditCard } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Fetching dashboard data...');
      const bookingsRes = await bookingAPI.getMyBookings();
      
      console.log('✅ API Response:', bookingsRes.data);
      
      // ✅ FIX: Handle different possible response structures
      const bookingsData = bookingsRes.data?.bookings || bookingsRes.data || [];
      
      console.log('📦 Bookings data:', bookingsData);
      console.log('📊 Number of bookings:', bookingsData.length);
      
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      console.error('Error details:', error.response?.data);
      setError('Failed to load bookings');
      setBookings([]); // ✅ Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingAPI.cancel(bookingId);
        setBookings(bookings.map(b => 
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        ));
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking');
      }
    }
  };

  // ✅ Calculate total spent safely
  const calculateTotalSpent = () => {
    return bookings.reduce((sum, b) => {
      const price = parseFloat(b.total_price) || 0;
      return sum + price;
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* ✅ Show error message if there's an error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 text-red-600 hover:text-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold">{bookings.length}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <FiCalendar className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Active Bookings</p>
              <p className="text-3xl font-bold">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiHome className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Spent</p>
              <p className="text-3xl font-bold">
                {formatCurrency(calculateTotalSpent())}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FiCreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Recent Bookings</h2>
        </div>
        
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
            <p className="text-gray-600">Start exploring properties to make your first booking!</p>
            <button
              onClick={() => window.location.href = '/properties'}
              className="btn-primary mt-4"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={booking.Property?.images?.[0] || 'https://via.placeholder.com/50'}
                          alt={booking.Property?.title || 'Property'}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                        <div>
                          <div className="font-medium">
                            {booking.Property?.title || 'Property'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.Property?.location || 'Location'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>{formatDate(booking.start_date)}</div>
                        <div className="text-gray-500">to {formatDate(booking.end_date)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(booking.total_price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge badge-${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.location.href = `/properties/${booking.property_id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View
                        </button>
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;