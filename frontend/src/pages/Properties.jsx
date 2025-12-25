import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { propertyAPI } from '../services/api';
import { FiFilter, FiSearch, FiGrid, FiList, FiLoader } from 'react-icons/fi';

const Properties = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    guests: searchParams.get('guests') || '',
    page: 1,
    limit: 12,
  });
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await propertyAPI.getAll(filters);
      setProperties(response.data.properties);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
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
      page: 1,
      limit: 12,
    });
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Find Your Perfect Stay</h1>
        <p className="text-gray-600">Discover amazing accommodations across Sri Lanka</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <FiFilter className="mr-2" />
                Filters
              </h2>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear All
              </button>
            </div>

            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="input-field pl-10"
                    placeholder="Search location..."
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (LKR)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="input-field"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="input-field"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="input-field"
                >
                  <option value="">Any</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guests
                </label>
                <input
                  type="number"
                  min="1"
                  value={filters.guests}
                  onChange={(e) => handleFilterChange('guests', e.target.value)}
                  className="input-field"
                  placeholder="Number of guests"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
              >
                Apply Filters
              </button>
            </form>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-600">
                Showing <span className="font-bold">{properties.length}</span> of{' '}
                <span className="font-bold">{total}</span> properties
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FiLoader className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-xl font-bold mb-2">No properties found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > filters.limit && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('page', filters.page - 1)}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {filters.page} of {Math.ceil(total / filters.limit)}
                </span>
                <button
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                  disabled={filters.page >= Math.ceil(total / filters.limit)}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Properties;