import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { propertyAPI } from '../services/api';
import {
  FiFilter,
  FiSearch,
  FiGrid,
  FiList,
  FiLoader,
  FiMapPin,
  FiDollarSign,
  FiHome,
  FiUsers,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCheck
} from 'react-icons/fi';
import { TbBed, TbBath, TbRuler } from 'react-icons/tb';

const Properties = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    guests: searchParams.get('guests') || '',
    propertyType: '',
    amenities: [],
    page: 1,
    limit: 12,
  });

  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [appliedFilters, setAppliedFilters] = useState({});

  const propertyTypes = [
    { value: 'house', label: 'House', icon: '🏠' },
    { value: 'apartment', label: 'Apartment', icon: '🏢' },
    { value: 'villa', label: 'Villa', icon: '🏰' },
    { value: 'cabin', label: 'Cabin', icon: '🏡' },
    { value: 'guesthouse', label: 'Guest House', icon: '🏨' },
    { value: 'unique', label: 'Unique Stay', icon: '🌟' }
  ];

  const amenitiesList = [
    { id: 'wifi', label: 'WiFi' },
    { id: 'pool', label: 'Swimming Pool' },
    { id: 'ac', label: 'Air Conditioning' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'parking', label: 'Free Parking' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'gym', label: 'Gym' },
    { id: 'laundry', label: 'Laundry' }
  ];

  const popularLocations = [
    { name: 'Colombo', count: 89 },
    { name: 'Galle', count: 42 },
    { name: 'Kandy', count: 31 },
    { name: 'Mirissa', count: 27 },
    { name: 'Ella', count: 23 },
    { name: 'Bentota', count: 18 }
  ];

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  useEffect(() => {
    // Update applied filters for display
    const activeFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '' && !['page', 'limit'].includes(key)) {
        if (Array.isArray(filters[key]) && filters[key].length > 0) {
          activeFilters[key] = filters[key];
        } else if (!Array.isArray(filters[key])) {
          activeFilters[key] = filters[key];
        }
      }
    });
    setAppliedFilters(activeFilters);
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await propertyAPI.getAll(filters);
      setProperties(response.data.properties);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Fallback mock data for development
      setProperties([
        {
          id: 1,
          title: 'Luxury Beachfront Villa in Galle',
          description: 'Beautiful villa with panoramic ocean view, private pool, and modern amenities',
          location: 'Galle Fort, Southern Province',
          price_per_night: 45000,
          bedrooms: 4,
          bathrooms: 3,
          max_guests: 8,
          property_type: 'villa',
          images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227'],
          host: { name: 'John Silva', profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' },
          verified_badge: true,
          averageRating: 4.8,
          amenities: ['Pool', 'WiFi', 'AC', 'Kitchen', 'Parking']
        },
        {
          id: 2,
          title: 'Modern Apartment in Colombo City Center',
          description: 'Stylish apartment with city views, walking distance to restaurants and shopping',
          location: 'Colombo 07, Western Province',
          price_per_night: 18000,
          bedrooms: 2,
          bathrooms: 2,
          max_guests: 4,
          property_type: 'apartment',
          images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'],
          host: { name: 'Sarah Perera', profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786' },
          verified_badge: true,
          averageRating: 4.6,
          amenities: ['WiFi', 'AC', 'Gym', 'Concierge']
        }
      ]);
      setTotal(125);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handleAmenityChange = (amenity) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];

    setFilters({ ...filters, amenities: newAmenities, page: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      guests: '',
      propertyType: '',
      amenities: [],
      page: 1,
      limit: 12,
    });
  };

  const removeFilter = (key, value = null) => {
    if (key === 'amenities' && value) {
      const newAmenities = filters.amenities.filter(a => a !== value);
      setFilters({ ...filters, amenities: newAmenities });
    } else {
      setFilters({ ...filters, [key]: Array.isArray(filters[key]) ? [] : '' });
    }
  };

  const handleLocationClick = (location) => {
    setFilters({ ...filters, location, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(total / filters.limit);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
      {/* Hero Banner */}
      <div
        className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 text-white pt-20 pb-16"
        style={{
          backgroundImage: 'linear-gradient(rgba(30, 58, 138, 0.85), rgba(30, 58, 138, 0.9)), url("https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          clipPath: 'polygon(0 0, 100% 0, 100% 90%, 0 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Discover Amazing Stays
              <span className="text-yellow-300 block">Across Sri Lanka</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Find your perfect accommodation from our curated collection of verified properties
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="w-full bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg flex items-center justify-center space-x-3 hover:shadow-xl transition-shadow border border-transparent dark:border-gray-800"
          >
            <FiFilter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="font-semibold dark:text-white">Show Filters</span>
            {Object.keys(appliedFilters).length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {Object.keys(appliedFilters).length}
              </span>
            )}
          </button>
        </div>

        {/* Applied Filters Bar */}
        {Object.keys(appliedFilters).length > 0 && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Filters:</span>
              {Object.entries(appliedFilters).map(([key, value]) => {
                if (Array.isArray(value)) {
                  return value.map(v => (
                    <button
                      key={`${key}-${v}`}
                      onClick={() => removeFilter(key, v)}
                      className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      {amenitiesList.find(a => a.id === v)?.label || v}
                      <FiX className="w-3 h-3" />
                    </button>
                  ));
                }
                return (
                  <button
                    key={key}
                    onClick={() => removeFilter(key)}
                    className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    {key === 'location' && <FiMapPin className="w-3 h-3" />}
                    {key === 'minPrice' && <FiDollarSign className="w-3 h-3" />}
                    {key === 'maxPrice' && <FiDollarSign className="w-3 h-3" />}
                    {key === 'bedrooms' && <TbBed className="w-3 h-3" />}
                    {key === 'guests' && <FiUsers className="w-3 h-3" />}
                    {key === 'propertyType' && <FiHome className="w-3 h-3" />}
                    {key}: {value}
                    <FiX className="w-3 h-3" />
                  </button>
                );
              })}
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sticky top-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FiFilter className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              <form onSubmit={handleSearch} className="space-y-8">
                {/* Location Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <FiMapPin className="w-4 h-4" />
                    Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Where are you going?"
                    />
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>

                  {/* Quick Locations */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Popular locations:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularLocations.map((loc) => (
                        <button
                          key={loc.name}
                          type="button"
                          onClick={() => handleLocationClick(loc.name)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-all ${filters.location === loc.name
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                          {loc.name}
                          <span className="text-xs opacity-75 ml-1">({loc.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4" />
                    Price Range (LKR)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Min"
                        min="0"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Max"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      value={filters.maxPrice || 50000}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FiHome className="w-4 h-4" />
                    Property Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {propertyTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleFilterChange('propertyType',
                          filters.propertyType === type.value ? '' : type.value
                        )}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${filters.propertyType === type.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900'
                          }`}
                      >
                        <span className="text-2xl mb-1">{type.icon}</span>
                        <span className="text-sm font-medium dark:text-gray-200">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <TbBed className="w-4 h-4" />
                    Bedrooms
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, '5+'].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleFilterChange('bedrooms',
                          filters.bedrooms === num.toString() ? '' : num.toString()
                        )}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${filters.bedrooms === num.toString()
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FiUsers className="w-4 h-4" />
                    Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={filters.guests}
                    onChange={(e) => handleFilterChange('guests', e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Number of guests"
                  />
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Amenities
                  </label>
                  <div className="space-y-2">
                    {amenitiesList.map((amenity) => (
                      <label
                        key={amenity.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={filters.amenities?.includes(amenity.id) || false}
                          onChange={() => handleAmenityChange(amenity.id)}
                          className="hidden"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${filters.amenities?.includes(amenity.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                          }`}>
                          {filters.amenities?.includes(amenity.id) && (
                            <FiCheck className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{amenity.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Apply Filters
                </button>
              </form>
            </div>
          </div>

          {/* Properties Section */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {total} Properties Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {filters.location
                      ? `In ${filters.location}, Sri Lanka`
                      : 'Across Sri Lanka'
                    }
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">View:</span>
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-3 rounded-lg transition-all ${viewMode === 'grid'
                          ? 'bg-white shadow-lg text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                        title="Grid View"
                      >
                        <FiGrid className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-3 rounded-lg transition-all ${viewMode === 'list'
                          ? 'bg-white shadow-lg text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                        title="List View"
                      >
                        <FiList className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sorted by</p>
                    <select className="bg-transparent font-medium text-gray-900 dark:text-white outline-none">
                      <option>Most Popular</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Highest Rated</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col justify-center items-center py-20">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <FiLoader className="w-8 h-8 text-blue-600 animate-pulse" />
                  </div>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400">Loading amazing properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="text-7xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">No properties found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Try adjusting your filters or search for a different location
                </p>
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                {/* Properties Grid/List */}
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-6'
                }>
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="text-gray-600 dark:text-gray-400">
                      Showing <span className="font-bold text-gray-900 dark:text-white">{((filters.page - 1) * filters.limit) + 1}</span>-
                      <span className="font-bold text-gray-900 dark:text-white">{Math.min(filters.page * filters.limit, total)}</span> of{' '}
                      <span className="font-bold text-gray-900 dark:text-white">{total}</span> properties
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page === 1}
                        className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiChevronLeft className="w-5 h-5" />
                      </button>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (filters.page <= 3) {
                          pageNum = i + 1;
                        } else if (filters.page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = filters.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-12 h-12 rounded-xl font-medium transition-all ${filters.page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page >= totalPages}
                        className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="mt-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-12 lg:p-16">
              <h3 className="text-3xl font-bold text-white mb-4">
                Get the Best Deals First
              </h3>
              <p className="text-blue-100 mb-8">
                Subscribe to our newsletter and be the first to know about special offers and new properties.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-6 py-3.5 rounded-xl outline-none dark:bg-gray-800 dark:text-white"
                />
                <button className="px-8 py-3.5 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg">
                  Subscribe
                </button>
              </div>
            </div>
            <div className="relative min-h-[200px] lg:min-h-[300px]">
              <img
                src="https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
                alt="Travel Inspiration"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowMobileFilters(false)}
            >
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-t-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-900 px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Filters</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <FiX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Mobile filters content - same as desktop but simplified */}
                <form onSubmit={(e) => { handleSearch(e); setShowMobileFilters(false); }} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg"
                        placeholder="Search location..."
                      />
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Price Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg"
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Property Type
                    </label>
                    <select
                      value={filters.propertyType}
                      onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg"
                    >
                      <option value="" className="dark:bg-gray-900">Any Type</option>
                      {propertyTypes.map(type => (
                        <option key={type.value} value={type.value} className="dark:bg-gray-900">
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Bedrooms
                    </label>
                    <select
                      value={filters.bedrooms}
                      onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg"
                    >
                      <option value="" className="dark:bg-gray-900">Any</option>
                      <option value="1" className="dark:bg-gray-900">1 Bedroom</option>
                      <option value="2" className="dark:bg-gray-900">2 Bedrooms</option>
                      <option value="3" className="dark:bg-gray-900">3+ Bedrooms</option>
                    </select>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Guests
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={filters.guests}
                      onChange={(e) => handleFilterChange('guests', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg"
                      placeholder="Number of guests"
                    />
                  </div>
                </form>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex gap-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={(e) => { handleSearch(e); setShowMobileFilters(false); }}
                  className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;