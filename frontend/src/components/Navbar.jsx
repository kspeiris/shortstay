import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiSearch, FiPlusCircle, FiUser, FiLogOut, FiBell, FiMenu, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <FiHome /> },
    { name: 'Properties', path: '/properties', icon: <FiSearch /> },
  ];

  if (user?.role === 'host' || user?.role === 'admin') {
    navLinks.push({ name: 'Add Property', path: '/properties/add', icon: <FiPlusCircle /> });
  }

  if (user?.role === 'host') {
    navLinks.push({ name: 'My Properties', path: '/host', icon: <FiHome /> });
  }

  if (user?.role === 'admin') {
    navLinks.push({ name: 'Admin', path: '/admin', icon: <FiUser /> });
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FiHome className="text-white" />
              </div>
              <span className="text-xl font-bold text-primary-600">ShortStay</span>
            </Link>

            <div className="hidden md:flex ml-10 space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition duration-200"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <FiBell className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="hidden md:flex items-center space-x-3">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center"
                    >
                      <FiUser className="w-4 h-4 text-primary-600" />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-slide-down">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiUser />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;