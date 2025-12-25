import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import PropertyCard from '../components/PropertyCard';
import { propertyAPI, testAPI } from '../services/api';
import { FiLoader, FiAlertCircle } from 'react-icons/fi';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      setApiStatus('checking');
      const healthRes = await testAPI.health();
      console.log('API Health:', healthRes.data);
      setApiStatus('healthy');
      fetchFeaturedProperties();
    } catch (healthError) {
      console.error('API Health Check Failed:', healthError);
      setApiStatus('unhealthy');
      setError('Backend API is not responding. Please make sure the backend server is running on http://localhost:5000');
      setLoading(false);
    }
  };

  const fetchFeaturedProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching featured properties...');
      const response = await propertyAPI.getAll({
        limit: 6,
        verified_badge: true,
      });
      
      console.log('Properties response:', response.data);
      setFeaturedProperties(response.data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(`Failed to load properties: ${error.message}`);
      
      // Set mock data for development/fallback
      setFeaturedProperties([
        {
          id: 1,
          title: 'Beachfront Villa in Galle',
          description: 'Beautiful villa with ocean view',
          location: 'Galle',
          price_per_night: 25000,
          bedrooms: 3,
          max_guests: 6,
          images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227'],
          User: { name: 'John Host', profile_image: null },
          verified_badge: true,
          averageRating: 4.5
        },
        {
          id: 2,
          title: 'Modern Apartment in Colombo',
          description: 'City center apartment',
          location: 'Colombo',
          price_per_night: 12000,
          bedrooms: 2,
          max_guests: 4,
          images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'],
          User: { name: 'Sarah Host', profile_image: null },
          verified_badge: true,
          averageRating: 4.2
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const retryFetch = () => {
    checkApiHealth();
  };

  return (
    <div>
      <Hero />
      
      <div className="page-container">
        {/* API Status Indicator */}
        {apiStatus !== 'healthy' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiAlertCircle className="text-yellow-600" size={20} />
                <div>
                  <p className="font-medium text-yellow-800">API Connection Issue</p>
                  <p className="text-sm text-yellow-700">
                    {apiStatus === 'checking' 
                      ? 'Checking backend connection...'
                      : error || 'Cannot connect to backend server'}
                  </p>
                </div>
              </div>
              <button
                onClick={retryFetch}
                className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors text-sm font-medium"
              >
                Retry
              </button>
            </div>
            
            <div className="mt-3 text-xs text-yellow-600">
              <p>Make sure:</p>
              <ul className="list-disc list-inside ml-2 mt-1">
                <li>Backend server is running on http://localhost:5000</li>
                <li>MySQL database is running and accessible</li>
                <li>Database tables are created (run database/schema.sql)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Featured Properties */}
        <section className="mb-16">
          <h2 className="section-title">Featured Properties</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FiLoader className="w-8 h-8 text-primary-600 animate-spin" />
              <span className="ml-3 text-gray-600">Loading properties...</span>
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-xl font-bold mb-2">No properties available</h3>
              <p className="text-gray-600 mb-4">Check your database connection or add sample data</p>
              <button
                onClick={retryFetch}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="section-title">How ShortStay Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Find Your Stay</h3>
              <p className="text-gray-600">
                Browse through hundreds of verified properties across Sri Lanka.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Book with Ease</h3>
              <p className="text-gray-600">
                Secure your booking with our easy-to-use platform.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Enjoy Your Stay</h3>
              <p className="text-gray-600">
                Experience authentic Sri Lankan hospitality.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-gradient-to-r from-primary-50 to-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose ShortStay?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-bold">Verified Properties</h4>
                  <p className="text-gray-600">All properties undergo verification for quality assurance.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-bold">Secure Payments</h4>
                  <p className="text-gray-600">Your payments are protected with our secure system.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-bold">24/7 Support</h4>
                  <p className="text-gray-600">Round-the-clock customer support for all your needs.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-bold">Local Experience</h4>
                  <p className="text-gray-600">Experience authentic Sri Lankan culture and hospitality.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;