import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔄 Checking authentication...');
    console.log('Stored token exists:', !!storedToken);
    console.log('Stored user exists:', !!storedUser);
    
    if (storedToken && storedUser) {
      try {
        // Set token for API calls
        setToken(storedToken);
        
        // Parse stored user
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Verify token is still valid by making API call
        const response = await authAPI.getProfile();
        console.log('✅ Token is valid, user:', response.data);
        
        // Update user with fresh data
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (error) {
        console.error('❌ Token validation failed:', error);
        
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        
        if (error.response?.status !== 401) {
          toast.error('Session expired. Please login again.');
        }
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await authAPI.login({ email, password });
      
      const { token, user: userData } = response.data;
      console.log('✅ Login successful, token received');
      console.log('User data:', userData);
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setToken(token);
      setUser(userData);
      
      toast.success('Login successful!');
      return userData;
    } catch (error) {
      console.error('❌ Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      const response = await authAPI.register(userData);
      
      const { token, user: newUser } = response.data;
      console.log('✅ Registration successful');
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setToken(token);
      setUser(newUser);
      
      toast.success('Registration successful!');
      return newUser;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      toast.error('Registration failed. Please try again.');
      throw error;
    }
  };

  const logout = () => {
    console.log('👋 Logging out user:', user?.email);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = { ...user, ...response.data.user };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('❌ Update profile failed:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isHost: user?.role === 'host',
    isGuest: user?.role === 'guest',
    isPaymentManager: user?.role === 'payment_manager',
    isFieldInspector: user?.role === 'field_inspector',
  };

  console.log('🎯 Auth context value:', {
    isAuthenticated: value.isAuthenticated,
    userRole: user?.role,
    userName: user?.name
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};