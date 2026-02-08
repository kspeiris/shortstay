import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiSearch,
  FiPlusCircle,
  FiUser,
  FiLogOut,
  FiBell,
  FiMenu,
  FiX,
  FiChevronDown,
  FiMessageSquare,
  FiHeart,
  FiBookmark,
  FiSettings,
  FiCalendar,
  FiShield
} from 'react-icons/fi';
import { TbBuilding } from 'react-icons/tb';
import { toast } from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    setIsProfileMenuOpen(false);
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const navLinks = [
    {
      name: 'Home',
      path: '/',
      icon: <FiHome className="w-4 h-4" />,
      active: location.pathname === '/'
    },
    {
      name: 'Browse',
      path: '/properties',
      icon: <FiSearch className="w-4 h-4" />,
      active: location.pathname.startsWith('/properties')
    },
    {
      name: 'How it Works',
      path: '/how-it-works',
      icon: <FiSettings className="w-4 h-4" />,
      active: location.pathname === '/how-it-works'
    },
  ];

  if (user?.role === 'host') {
    navLinks.push({
      name: 'Host Dashboard',
      path: '/host',
      icon: <TbBuilding className="w-4 h-4" />,
      active: location.pathname.startsWith('/host')
    });
    navLinks.push({
      name: 'Add Property',
      path: '/properties/add',
      icon: <FiPlusCircle className="w-4 h-4" />,
      active: location.pathname === '/properties/add'
    });
  }

  if (user?.role === 'admin') {
    navLinks.push({
      name: 'Admin Panel',
      path: '/admin',
      icon: <FiShield className="w-4 h-4" />,
      active: location.pathname.startsWith('/admin')
    });
  }

  const userMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiHome className="w-4 h-4" /> },
    { name: 'My Bookings', path: '/bookings', icon: <FiCalendar className="w-4 h-4" /> },
    { name: 'My Favorites', path: '/favorites', icon: <FiHeart className="w-4 h-4" /> },
    { name: 'Messages', path: '/messages', icon: <FiMessageSquare className="w-4 h-4" /> },
    { name: 'Account Settings', path: '/settings', icon: <FiSettings className="w-4 h-4" /> },
  ];

  const hostMenuItems = [
    { name: 'My Properties', path: '/host/properties', icon: <TbBuilding className="w-4 h-4" /> },
    { name: 'Bookings', path: '/host/bookings', icon: <FiCalendar className="w-4 h-4" /> },
    { name: 'Earnings', path: '/host/earnings', icon: <FiBookmark className="w-4 h-4" /> },
    { name: 'Reviews', path: '/host/reviews', icon: <FiMessageSquare className="w-4 h-4" /> },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
      ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-xl'
      : 'bg-white dark:bg-gray-900 shadow-lg'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-lg">
                  <FiHome className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                  ShortStay
                </span>
                <span className="text-xs text-gray-500 font-medium">Sri Lanka</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-12 space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${link.active
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                  {link.active && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                  <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Profile */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <div className="relative">
                      <img
                        src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff`}
                        alt={user?.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span className="capitalize">{user?.role}</span>
                        <FiChevronDown className={`ml-1 w-3 h-3 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 py-2 animate-slide-down z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff`}
                            alt={user?.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{user?.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{getGreeting()}! 👋</div>
                            <div className="text-xs text-blue-600 font-medium capitalize mt-1">
                              {user?.role} Account
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/50 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                          >
                            <div className="text-gray-400 group-hover:text-blue-600">
                              {item.icon}
                            </div>
                            <span>{item.name}</span>
                          </Link>
                        ))}

                        {/* Host Specific Items */}
                        {user?.role === 'host' && (
                          <>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">
                              Host Tools
                            </div>
                            {hostMenuItems.map((item) => (
                              <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="flex items-center space-x-3 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                              >
                                <div className="text-gray-400 group-hover:text-blue-600">
                                  {item.icon}
                                </div>
                                <span>{item.name}</span>
                              </Link>
                            ))}
                          </>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors rounded-xl hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}

            {/* Theme Toggle */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-slide-down border-t border-gray-100 dark:border-gray-800">
          <div className="bg-white dark:bg-gray-900 px-4 py-3 space-y-1">
            {/* Mobile Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${link.active
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}

            {/* Authentication Links for Mobile */}
            {!isAuthenticated ? (
              <div className="pt-2 space-y-2">
                <Link
                  to="/login"
                  className="flex items-center justify-center px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center space-x-3 px-4 py-3 mb-2">
                  <img
                    src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff`}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{user?.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{user?.role}</div>
                  </div>
                </div>

                {userMenuItems.slice(0, 3).map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}

                {user?.role === 'host' && hostMenuItems.slice(0, 2).map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-2.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl mt-2"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;