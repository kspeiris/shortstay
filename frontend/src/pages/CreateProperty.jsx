import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyAPI } from '../services/api';
import ImageUpload from '../components/ImageUpload';
import { FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const CreateProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    price_per_night: '',
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    amenities: [],
    latitude: '',
    longitude: '',
  });

  const availableAmenities = [
    'WiFi', 'Air Conditioning', 'Heating', 'Kitchen', 'Free Parking',
    'Pool', 'Hot Tub', 'Washer', 'Dryer', 'Breakfast', 'Gym',
    'TV', 'Security Cameras', 'Fireplace', 'BBQ Grill'
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchPropertyData();
    }
  }, [id]);

  const fetchPropertyData = async () => {
    try {
      const response = await propertyAPI.getById(id);
      const property = response.data.property;
      
      setFormData({
        title: property.title,
        description: property.description,
        location: property.location,
        address: property.address,
        price_per_night: property.price_per_night,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        max_guests: property.max_guests,
        amenities: property.amenities || [],
        latitude: property.latitude || '',
        longitude: property.longitude || '',
      });
    } catch (error) {
      toast.error('Failed to load property data');
      navigate('/host');
    }
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        price_per_night: parseFloat(formData.price_per_night),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        max_guests: parseInt(formData.max_guests),
      };

      if (isEditMode) {
        await propertyAPI.update(id, data);
        toast.success('Property updated successfully');
      } else {
        await propertyAPI.create(data);
        toast.success('Property created successfully');
      }

      navigate('/host');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Edit Property' : 'Add New Property'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Update your property details' : 'List your property for guests to book'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-6">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="input-field"
                  placeholder="Beautiful Beachfront Villa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field h-32"
                  placeholder="Describe your property in detail..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="input-field"
                    placeholder="Galle, Sri Lanka"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="input-field"
                    placeholder="123 Beach Road, Galle"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-6">Pricing & Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Night (LKR) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price_per_night}
                  onChange={(e) => setFormData({...formData, price_per_night: e.target.value})}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Guests *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.max_guests}
                  onChange={(e) => setFormData({...formData, max_guests: e.target.value})}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-6">Photos</h2>
            
            <ImageUpload
              images={isEditMode ? [] : []}
              onChange={(images) => {
                // Handle image changes
                console.log('Images changed:', images);
              }}
              maxImages={10}
            />
          </div>

          {/* Amenities */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-6">Amenities</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableAmenities.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`flex items-center space-x-2 p-3 rounded-lg border ${
                    formData.amenities.includes(amenity)
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-400'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    formData.amenities.includes(amenity)
                      ? 'bg-primary-600 border-primary-600'
                      : 'border-gray-400'
                  }`}>
                    {formData.amenities.includes(amenity) && (
                      <FiCheck className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span>{amenity}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location Details */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-6">Location Details (Optional)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                  className="input-field"
                  placeholder="6.927079"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                  className="input-field"
                  placeholder="79.861244"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/host')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></div>
              ) : isEditMode ? (
                'Update Property'
              ) : (
                'Create Property'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProperty;