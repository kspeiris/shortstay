import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, propertyAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/format';
import { FiCalendar, FiHome, FiCreditCard, FiSettings, FiStar } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes] = await Promise.all([
        bookingAPI.getMyBookings(),
      ]);
      setBookings(bookingsRes.data.bookings);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      }
    }
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

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
                {formatCurrency(bookings.reduce((sum, b) => sum + parseFloat(b.total_price), 0))}
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
                <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        alt={booking.Property?.title}
                        className="w-10 h-10 rounded-lg object-cover mr-3"
                      />
                      <div>
                        <div className="font-medium">{booking.Property?.title}</div>
                        <div className="text-sm text-gray-500">{booking.Property?.location}</div>
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

        {bookings.length === 0 && (
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;