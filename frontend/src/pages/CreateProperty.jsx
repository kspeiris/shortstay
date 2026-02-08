import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyAPI } from '../services/api';
import ImageUpload from '../components/ImageUpload';
import { 
  FiCheck, 
  FiHome, 
  FiMapPin, 
  FiDollarSign, 
  FiUsers, 
  FiCamera,
  FiTool,
  FiNavigation,
  FiX,
  FiLoader,
  FiChevronLeft,
  FiInfo,
  FiWifi,
  FiCoffee,
  FiWind,
  FiKey,
  FiTv
} from 'react-icons/fi';
import { TbBed, TbBath, TbRuler } from 'react-icons/tb';
import { MdPool, MdKitchen, MdLocalLaundryService } from 'react-icons/md';
import { toast } from 'react-hot-toast';

const CreateProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    price_per_night: '',
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    property_type: 'house',
    size: '',
    amenities: [],
    latitude: '',
    longitude: '',
    house_rules: '',
    check_in_time: '14:00',
    check_out_time: '11:00',
    cancellation_policy: 'flexible',
    images: []
  });

  const propertyTypes = [
    { value: 'house', label: 'House', icon: '🏠' },
    { value: 'apartment', label: 'Apartment', icon: '🏢' },
    { value: 'villa', label: 'Villa', icon: '🏰' },
    { value: 'cabin', label: 'Cabin', icon: '🏡' },
    { value: 'guesthouse', label: 'Guest House', icon: '🏨' },
    { value: 'unique', label: 'Unique Stay', icon: '🌟' }
  ];

  const availableAmenities = [
    { id: 'wifi', label: 'WiFi', icon: <FiWifi className="w-5 h-5" /> },
    { id: 'kitchen', label: 'Kitchen', icon: <MdKitchen className="w-5 h-5" /> },
    { id: 'ac', label: 'Air Conditioning', icon: <FiWind className="w-5 h-5" /> },
    { id: 'pool', label: 'Swimming Pool', icon: <MdPool className="w-5 h-5" /> },
    { id: 'parking', label: 'Free Parking', icon: <FiKey className="w-5 h-5" /> },
    { id: 'tv', label: 'TV', icon: <FiTv className="w-5 h-5" /> },
    { id: 'breakfast', label: 'Breakfast', icon: <FiCoffee className="w-5 h-5" /> },
    { id: 'laundry', label: 'Washer & Dryer', icon: <MdLocalLaundryService className="w-5 h-5" /> },
    { id: 'gym', label: 'Gym', icon: '💪' },
    { id: 'hot_tub', label: 'Hot Tub', icon: '🛁' },
    { id: 'bbq', label: 'BBQ Grill', icon: '🔥' },
    { id: 'fireplace', label: 'Fireplace', icon: '🔥' },
    { id: 'security', label: 'Security Cameras', icon: '📹' },
    { id: 'pet_friendly', label: 'Pet Friendly', icon: '🐾' },
    { id: 'family_friendly', label: 'Family Friendly', icon: '👨‍👩‍👧‍👦' },
    { id: 'ocean_view', label: 'Ocean View', icon: '🌊' }
  ];

  const cancellationPolicies = [
    { value: 'flexible', label: 'Flexible', description: 'Full refund 24 hours before check-in' },
    { value: 'moderate', label: 'Moderate', description: 'Full refund 5 days before check-in' },
    { value: 'strict', label: 'Strict', description: '50% refund up to 1 week before check-in' },
    { value: 'non_refundable', label: 'Non-refundable', description: 'No refunds after booking' }
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchPropertyData();
    }
  }, [id]);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getById(id);
      const property = response.data.property;
      
      setFormData({
        title: property.title || '',
        description: property.description || '',
        location: property.location || '',
        address: property.address || '',
        price_per_night: property.price_per_night || '',
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        max_guests: property.max_guests || 2,
        property_type: property.property_type || 'house',
        size: property.size || '',
        amenities: property.amenities || [],
        latitude: property.latitude || '',
        longitude: property.longitude || '',
        house_rules: property.house_rules || '',
        check_in_time: property.check_in_time || '14:00',
        check_out_time: property.check_out_time || '11:00',
        cancellation_policy: property.cancellation_policy || 'flexible',
        images: property.images || []
      });
      toast.success('Property loaded successfully');
    } catch (error) {
      toast.error('Failed to load property data');
      navigate('/host');
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (amenityId) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.title || !formData.description || !formData.location || !formData.address) {
          toast.error('Please fill in all required fields');
          return false;
        }
        return true;
      case 2:
        if (!formData.price_per_night || formData.price_per_night <= 0) {
          toast.error('Please enter a valid price');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setLoading(true);

    try {
      const data = {
        ...formData,
        price_per_night: parseFloat(formData.price_per_night),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        max_guests: parseInt(formData.max_guests),
        size: formData.size ? parseInt(formData.size) : null,
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((stepNumber) => (
        <React.Fragment key={stepNumber}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              step === stepNumber
                ? 'border-blue-600 bg-blue-600 text-white'
                : step > stepNumber
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 bg-white text-gray-400'
            }`}>
              {step > stepNumber ? <FiCheck className="w-5 h-5" /> : stepNumber}
            </div>
            <span className="text-xs mt-2 font-medium whitespace-nowrap">
              {stepNumber === 1 ? 'Basic Info' : 
               stepNumber === 2 ? 'Pricing & Details' : 
               stepNumber === 3 ? 'Amenities' : 'Finish'}
            </span>
          </div>
          {stepNumber < 4 && (
            <div className={`w-16 h-0.5 mx-2 ${
              step > stepNumber ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1: // Basic Information
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Basic Information</h3>
              <p className="text-gray-600">Tell us about your property</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FiHome className="w-4 h-4" />
                  Property Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Beautiful Beachfront Villa in Galle"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FiInfo className="w-4 h-4" />
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="Describe your property in detail. What makes it special? What can guests expect?"
                  rows={6}
                  maxLength={2000}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {formData.description.length}/2000 characters
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FiMapPin className="w-4 h-4" />
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Galle, Sri Lanka"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FiNavigation className="w-4 h-4" />
                    Full Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="123 Beach Road, Galle Fort"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Property Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {propertyTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({...formData, property_type: type.value})}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
                        formData.property_type === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl mb-2">{type.icon}</span>
                      <span className="font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Pricing & Details
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pricing & Details</h3>
              <p className="text-gray-600">Set your pricing and property specifications</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4" />
                    Price per Night (LKR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">LKR</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      value={formData.price_per_night}
                      onChange={(e) => setFormData({...formData, price_per_night: e.target.value})}
                      className="w-full pl-16 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <TbBed className="w-4 h-4" />
                      Bedrooms *
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, bedrooms: Math.max(1, formData.bedrooms - 1)})}
                        className="w-12 h-12 bg-gray-100 rounded-l-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <span className="text-xl">-</span>
                      </button>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value) || 1})}
                        className="w-full h-12 bg-gray-50 border-x-0 border-gray-300 text-center focus:ring-0 focus:border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, bedrooms: formData.bedrooms + 1})}
                        className="w-12 h-12 bg-gray-100 rounded-r-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <span className="text-xl">+</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <TbBath className="w-4 h-4" />
                      Bathrooms *
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, bathrooms: Math.max(1, formData.bathrooms - 1)})}
                        className="w-12 h-12 bg-gray-100 rounded-l-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <span className="text-xl">-</span>
                      </button>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({...formData, bathrooms: parseInt(e.target.value) || 1})}
                        className="w-full h-12 bg-gray-50 border-x-0 border-gray-300 text-center focus:ring-0 focus:border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, bathrooms: formData.bathrooms + 1})}
                        className="w-12 h-12 bg-gray-100 rounded-r-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <span className="text-xl">+</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FiUsers className="w-4 h-4" />
                      Max Guests *
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, max_guests: Math.max(1, formData.max_guests - 1)})}
                        className="w-12 h-12 bg-gray-100 rounded-l-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <span className="text-xl">-</span>
                      </button>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.max_guests}
                        onChange={(e) => setFormData({...formData, max_guests: parseInt(e.target.value) || 1})}
                        className="w-full h-12 bg-gray-50 border-x-0 border-gray-300 text-center focus:ring-0 focus:border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, max_guests: formData.max_guests + 1})}
                        className="w-12 h-12 bg-gray-100 rounded-r-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <span className="text-xl">+</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <TbRuler className="w-4 h-4" />
                    Size (Square Feet)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g., 1200"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    House Rules
                  </label>
                  <textarea
                    value={formData.house_rules}
                    onChange={(e) => setFormData({...formData, house_rules: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    placeholder="List any rules guests should follow (e.g., No smoking, No pets, Quiet hours from 10 PM)"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Check-in Time
                    </label>
                    <input
                      type="time"
                      value={formData.check_in_time}
                      onChange={(e) => setFormData({...formData, check_in_time: e.target.value})}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Check-out Time
                    </label>
                    <input
                      type="time"
                      value={formData.check_out_time}
                      onChange={(e) => setFormData({...formData, check_out_time: e.target.value})}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Cancellation Policy
                  </label>
                  <div className="space-y-2">
                    {cancellationPolicies.map((policy) => (
                      <label
                        key={policy.value}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.cancellation_policy === policy.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="cancellation_policy"
                          value={policy.value}
                          checked={formData.cancellation_policy === policy.value}
                          onChange={(e) => setFormData({...formData, cancellation_policy: e.target.value})}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium">{policy.label}</div>
                          <div className="text-sm text-gray-600">{policy.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Amenities
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Amenities & Features</h3>
              <p className="text-gray-600">Select amenities available at your property</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableAmenities.map((amenity) => (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
                    formData.amenities.includes(amenity.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`text-2xl mb-2 ${
                    formData.amenities.includes(amenity.id) ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {amenity.icon}
                  </div>
                  <span className="font-medium text-sm">{amenity.label}</span>
                  {formData.amenities.includes(amenity.id) && (
                    <div className="mt-2 p-1 bg-blue-600 text-white rounded-full">
                      <FiCheck className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Location Details (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="6.927079"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="79.861244"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Photos
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Photos</h3>
              <p className="text-gray-600 mb-6">Add high-quality photos to showcase your property</p>
              
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
                <div className="flex items-start gap-3">
                  <FiCamera className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-blue-800 mb-1">Photo Guidelines</div>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Upload at least 5 photos (10 maximum)</li>
                      <li>• Use high-resolution images (min. 1280x720)</li>
                      <li>• Include photos of all rooms and key features</li>
                      <li>• First image will be the cover photo</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <ImageUpload
              images={formData.images}
              onChange={(images) => setFormData({...formData, images})}
              maxImages={10}
            />

            <div className="p-6 bg-gray-50 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-4">Final Review</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Title:</span>
                  <span className="font-medium">{formData.title || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{formData.location || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price per night:</span>
                  <span className="font-medium">LKR {formData.price_per_night || '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amenities:</span>
                  <span className="font-medium">{formData.amenities.length} selected</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <FiLoader className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-lg text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/host')}
                className="flex items-center text-blue-200 hover:text-white mb-4"
              >
                <FiChevronLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {isEditMode ? 'Edit Property' : 'Create New Property'}
              </h1>
              <p className="text-blue-200">
                {isEditMode ? 'Update your property listing' : 'Start earning by listing your space'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Step Indicator */}
          <div className="p-6 border-b border-gray-100">
            {renderStepIndicator()}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                  disabled={loading}
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/host')}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Continue
                  <span className="text-sm">Step {step} of 4</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <FiLoader className="w-5 h-5 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-5 h-5" />
                      {isEditMode ? 'Update Property' : 'Publish Property'}
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProperty;