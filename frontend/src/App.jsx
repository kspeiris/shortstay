import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import CreateProperty from './pages/CreateProperty';
import Dashboard from './pages/Dashboard';
import HostDashboard from './pages/HostDashboard';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/host" element={
                <PrivateRoute allowedRoles={['host', 'admin']}>
                  <HostDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/properties/add" element={
                <PrivateRoute allowedRoles={['host', 'admin']}>
                  <CreateProperty />
                </PrivateRoute>
              } />
              
              <Route path="/properties/:id/edit" element={
                <PrivateRoute allowedRoles={['host', 'admin']}>
                  <CreateProperty />
                </PrivateRoute>
              } />
              
              <Route path="/admin" element={
                <PrivateRoute allowedRoles={['admin']}>
                  <Admin />
                </PrivateRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;