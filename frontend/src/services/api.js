import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`📤 API Request [${config.method?.toUpperCase()}] ${config.url}`);
      console.log('🔑 Token added to headers');
    } else {
      console.log(`📤 API Request [${config.method?.toUpperCase()}] ${config.url} - No token`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response [${response.status}] ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error [${error.response?.status || 'NO STATUS'}] ${error.config?.url}`);
    console.error('Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - Clearing local storage');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only show toast if not already on login page
      if (!window.location.pathname.includes('/login')) {
        toast.error('Session expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    } else if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission.');
    } else if (error.response?.status === 404) {
      console.log('Resource not found');
    } else if (error.response?.status === 500) {
      const errorMessage = error.response?.data?.message || 'Server error';
      toast.error(`Server Error: ${errorMessage}`);
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Property API
export const propertyAPI = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (propertyData) => api.post('/properties', propertyData),
  update: (id, propertyData) => api.put(`/properties/${id}`, propertyData),
  delete: (id) => api.delete(`/properties/${id}`),
  getMyProperties: () => api.get('/properties/my-properties'),
  uploadImages: (id, formData) => api.post(`/properties/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Booking API
export const bookingAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  getPropertyBookings: (propertyId) => api.get(`/bookings/property/${propertyId}`),
};

// Review API
export const reviewAPI = {
  create: (reviewData) => api.post('/reviews', reviewData),
  getByProperty: (propertyId) => api.get(`/reviews/property/${propertyId}`),
  update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Admin API
// Replace the Admin API section in your existing api.js file with this:

// Admin API - Updated to match backend routes
export const adminAPI = {
  // Dashboard Stats
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // Users Management
  getUsers: () => api.get('/admin/users'),
  getAllUsers: () => api.get('/admin/users'), // Alias for compatibility
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  
  // Properties Management
  getPendingProperties: () => api.get('/admin/properties/pending'),
  getAllProperties: () => api.get('/admin/properties'),
  updatePropertyStatus: (propertyId, statusData) => api.put(`/admin/properties/${propertyId}/status`, statusData),
  deleteProperty: (propertyId) => api.delete(`/admin/properties/${propertyId}`),
  
  // Payments Management
  getPayments: () => api.get('/admin/payments'),
  getAllPayments: () => api.get('/admin/payments'), // Alias for compatibility
  
  // Bookings Management (if needed)
  getAllBookings: () => api.get('/admin/bookings'),
  updateBookingStatus: (bookingId, status) => api.put(`/admin/bookings/${bookingId}/status`, { status }),
};

// Test API
export const testAPI = {
  checkConnection: () => api.get('/test'),
  getServerStatus: () => api.get('/health'),
};

export default api;