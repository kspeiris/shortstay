import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyAPI, bookingAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/format';
import { 
  FiHome, FiCalendar, FiDollarSign, FiPlus, 
  FiEdit, FiTrash2, FiCheck, FiX 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const HostDashboard = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');

  useEffect(() => {
    fetchHostData();
  }, []);

  const fetchHostData = async () => {
    try {
      const [propertiesRes, bookingsRes] = await Promise.all([
        propertyAPI.getMyProperties(),
        bookingAPI.getHostBookings(),
      ]);
      setProperties(propertiesRes.data.properties);
      setBookings(bookingsRes.data.bookings);
    } catch (error) {
      toast.error('Failed to load host data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertyAPI.delete(propertyId);
        setProperties(properties.filter(p => p.id !== propertyId));
        toast.success('Property deleted successfully');
      } catch (error) {
        toast.error('Failed to delete property');
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
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  const calculateEarnings = () => {
    return bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + parseFloat(b.Payment?.amount || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Host Dashboard</h1>
            <p className="text-gray-600">Manage your properties and bookings</p>
          </div>
          <button
            onClick={() => navigate('/properties/add')}
            className="btn-primary flex items-center"
          >
            <FiPlus className="mr-2" />
            Add Property
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Properties</p>
              <p className="text-3xl font-bold">{properties.length}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <FiHome className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold">{bookings.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiCalendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Pending Bookings</p>
              <p className="text-3xl font-bold">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiCalendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Earnings</p>
              <p className="text-3xl font-bold">{formatCurrency(calculateEarnings())}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FiDollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('properties')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'properties'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Properties
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bookings
            </button>
          </nav>
        </div>
      </div>

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">My Properties</h2>
          </div>
          
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <FiHome className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No properties yet</h3>
              <p className="text-gray-600 mb-4">Start hosting by adding your first property</p>
              <button
                onClick={() => navigate('/properties/add')}
                className="btn-primary"
              >
                Add Property
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={property.images?.[0] || 'https://via.placeholder.com/50'}
                            alt={property.title}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <div className="font-medium">{property.title}</div>
                            <div className="text-sm text-gray-500">{property.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge badge-${getStatusColor(property.status)}`}>
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(property.price_per_night)}/night
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/properties/${property.id}`)}
                            className="text-primary-600 hover:text-primary-700 p-1"
                            title="View"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/properties/${property.id}/edit`)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Edit"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(property.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Booking Requests</h2>
          </div>
          
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
              <p className="text-gray-600">Your booking requests will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
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
                        <div className="font-medium">{booking.Guest?.name}</div>
                        <div className="text-sm text-gray-500">{booking.Guest?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{booking.Property?.title}</div>
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
                        {booking.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                              className="text-green-600 hover:text-green-700 p-1"
                              title="Approve"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Reject"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HostDashboard;