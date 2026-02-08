import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { adminAPI } from '../services/api';
import { formatCurrency, formatDate, getRoleBadge } from '../utils/format';
import { 
  FiUsers, FiHome, FiDollarSign, FiCalendar,
  FiCheck, FiX, FiRefreshCw, FiEye
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        usersRes,
        pendingRes,
        paymentsRes
      ] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getUsers(),
        adminAPI.getPendingProperties(),
        adminAPI.getPayments(),
      ]);

      console.log('📊 Admin data received:', {
        stats: statsRes.data,
        users: usersRes.data,
        properties: pendingRes.data,
        payments: paymentsRes.data
      });

      setStats(statsRes.data || {});
      setUsers(usersRes.data?.users || []);
      setPendingProperties(pendingRes.data?.properties || []);
      setPayments(paymentsRes.data?.payments || []);
      
      if (activeTab === 'overview') {
        toast.success('Data loaded successfully');
      }
    } catch (error) {
      console.error('❌ Failed to load admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProperty = async (propertyId) => {
    try {
      await adminAPI.updatePropertyStatus(propertyId, { status: 'approved' });
      setPendingProperties(pendingProperties.filter(p => p.id !== propertyId));
      toast.success('Property approved successfully');
      fetchAdminData();
    } catch (error) {
      console.error('Failed to approve property:', error);
      toast.error('Failed to approve property');
    }
  };

  const handleRejectProperty = async (propertyId) => {
    try {
      await adminAPI.updatePropertyStatus(propertyId, { status: 'rejected' });
      setPendingProperties(pendingProperties.filter(p => p.id !== propertyId));
      toast.success('Property rejected successfully');
      fetchAdminData();
    } catch (error) {
      console.error('Failed to reject property:', error);
      toast.error('Failed to reject property');
    }
  };

  const handleUpdateUserRole = async (userId, role) => {
    try {
      await adminAPI.updateUser(userId, { role });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role } : u
      ));
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleVerifyUser = async (userId, verified) => {
    try {
      await adminAPI.updateUser(userId, { verified });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, verified } : u
      ));
      toast.success(`User ${verified ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      console.error('Failed to update user verification:', error);
      toast.error('Failed to update user verification');
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'secondary';
    
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
      case 'cancelled':
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Chart data with safe defaults
  const revenueChartData = {
    labels: stats?.monthlyRevenue?.map(r => r.month) || [],
    datasets: [
      {
        label: 'Revenue (LKR)',
        data: stats?.monthlyRevenue?.map(r => r.total) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const userRoleChartData = {
    labels: ['Guests', 'Hosts', 'Admins'],
    datasets: [
      {
        data: [
          users.filter(u => u.role === 'guest').length,
          users.filter(u => u.role === 'host').length,
          users.filter(u => u.role === 'admin').length,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(139, 92, 246, 0.5)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="page-container min-h-screen transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage the ShortStay platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold">{stats?.stats?.totalUsers || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Properties</p>
              <p className="text-3xl font-bold">{stats?.stats?.totalProperties || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiHome className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Total Bookings</p>
              <p className="text-3xl font-bold">{stats?.stats?.totalBookings || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FiCalendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold">
                {formatCurrency(stats?.stats?.totalRevenue || 0)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiDollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'users', 'properties', 'payments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Monthly Revenue</h3>
              <div className="h-64">
                {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
                  <Bar 
                    data={revenueChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No revenue data available
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">User Distribution</h3>
              <div className="h-64">
                {users.length > 0 ? (
                  <Pie 
                    data={userRoleChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No user data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pending Properties */}
          <div className="card">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pending Properties</h3>
                <span className="badge badge-warning">
                  {pendingProperties.length} pending
                </span>
              </div>
            </div>
            
            {pendingProperties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No pending properties</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Host
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {pendingProperties.map((property) => (
                      <tr key={property.id} className="hover:bg-gray-50 dark:bg-gray-800/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={property.images?.[0] || 'https://via.placeholder.com/50'}
                              alt={property.title || 'Property'}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/50';
                              }}
                            />
                            <div>
                              <div className="font-medium">{property.title || 'Untitled'}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{property.location || 'No location'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {/* ✅ Fixed: Use lowercase 'host' */}
                          <div>{property.host?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{property.host?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {formatCurrency(property.price_per_night || 0)}/night
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveProperty(property.id)}
                              className="btn-primary px-3 py-1 text-sm"
                            >
                              <FiCheck className="inline mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectProperty(property.id)}
                              className="btn-danger px-3 py-1 text-sm"
                            >
                              <FiX className="inline mr-1" />
                              Reject
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

          {/* Recent Bookings */}
          <div className="card">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold">Recent Bookings</h3>
            </div>
            
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {stats.recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 dark:bg-gray-800/50">
                        <td className="px-6 py-4">
                          {/* ✅ Fixed: Use lowercase 'guest' */}
                          <div className="font-medium">{booking.guest?.name || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4">
                          {/* ✅ Fixed: Use lowercase 'property' */}
                          <div className="font-medium">{booking.property?.title || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {formatCurrency(booking.total_price || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No recent bookings</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">All Users</h3>
              <span className="text-gray-600 dark:text-gray-400">{users.length} users</span>
            </div>
          </div>
          
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:bg-gray-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={user.profile_image || 'https://via.placeholder.com/40'}
                            alt={user.name || 'User'}
                            className="w-10 h-10 rounded-full mr-3"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/40';
                            }}
                          />
                          <div>
                            <div className="font-medium">{user.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role || 'guest'}
                          onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                          className="input-field py-1 text-sm"
                        >
                          <option value="guest">Guest</option>
                          <option value="host">Host</option>
                          <option value="admin">Admin</option>
                          <option value="payment_manager">Payment Manager</option>
                          <option value="field_inspector">Field Inspector</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`badge ${getRoleBadge(user.role)}`}>
                            {user.role || 'guest'}
                          </span>
                          <button
                            onClick={() => handleVerifyUser(user.id, !user.verified)}
                            className={`px-2 py-1 rounded text-xs ${
                              user.verified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user.verified ? 'Verified' : 'Unverified'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(user.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVerifyUser(user.id, !user.verified)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            {user.verified ? 'Unverify' : 'Verify'}
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

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Pending Properties ({pendingProperties.length})</h3>
            <button
              onClick={fetchAdminData}
              className="flex items-center text-sm text-primary-600 hover:text-primary-700"
            >
              <FiRefreshCw className="mr-1" />
              Refresh
            </button>
          </div>
          
          {pendingProperties.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">No pending properties</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingProperties.map((property) => (
                <div key={property.id} className="card">
                  <img
                    src={property.images?.[0] || 'https://via.placeholder.com/400x200'}
                    alt={property.title || 'Property'}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x200';
                    }}
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold">{property.title || 'Untitled'}</h4>
                      <span className={`badge badge-${getStatusColor(property.status)}`}>
                        {property.status || 'N/A'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{property.location || 'No location'}</p>
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-bold text-primary-600">
                        {formatCurrency(property.price_per_night || 0)}/night
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveProperty(property.id)}
                        className="flex-1 btn-primary px-3 py-2 text-sm"
                      >
                        <FiCheck className="inline mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectProperty(property.id)}
                        className="flex-1 btn-danger px-3 py-2 text-sm"
                      >
                        <FiX className="inline mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="card">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold">Payment Transactions</h3>
          </div>
          
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No payment transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:bg-gray-800/50">
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm">{payment.transaction_id || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {/* ✅ Fixed: Use lowercase 'booking' and 'guest' */}
                        <div>{payment.booking?.guest?.name || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {/* ✅ Fixed: Use lowercase 'booking' and 'property' */}
                        <div>{payment.booking?.property?.title || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(payment.amount || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge badge-${getStatusColor(payment.status)}`}>
                          {payment.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(payment.payment_date)}
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

      {/* Add a refresh button at the bottom */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh All Data'}
        </button>
      </div>
    </div>
  );
};

export default Admin;