import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiCalendar, FiUsers, FiMapPin } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Hero = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    location: '',
    startDate: null,
    endDate: null,
    guests: 1,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      location: searchParams.location,
      guests: searchParams.guests,
      ...(searchParams.startDate && { startDate: searchParams.startDate.toISOString().split('T')[0] }),
      ...(searchParams.endDate && { endDate: searchParams.endDate.toISOString().split('T')[0] }),
    });
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="relative bg-gradient-to-r from-primary-500 to-primary-700 text-white">
      <div className="absolute inset-0 bg-black opacity-20"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in">
            Find Your Perfect Short Stay
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Discover unique accommodations from local hosts across Sri Lanka.
            Book your stay with confidence and experience authentic hospitality.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 border border-transparent dark:border-gray-800 transition-colors duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FiMapPin />
                  <span>Location</span>
                </label>
                <input
                  type="text"
                  placeholder="Where do you want to stay?"
                  className="input-field"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                />
              </div>

              {/* Check-in */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FiCalendar />
                  <span>Check-in</span>
                </label>
                <DatePicker
                  selected={searchParams.startDate}
                  onChange={(date) => setSearchParams({ ...searchParams, startDate: date })}
                  minDate={new Date()}
                  placeholderText="Select date"
                  className="input-field"
                  dateFormat="MMM dd, yyyy"
                />
              </div>

              {/* Check-out */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FiCalendar />
                  <span>Check-out</span>
                </label>
                <DatePicker
                  selected={searchParams.endDate}
                  onChange={(date) => setSearchParams({ ...searchParams, endDate: date })}
                  minDate={searchParams.startDate || new Date()}
                  placeholderText="Select date"
                  className="input-field"
                  dateFormat="MMM dd, yyyy"
                />
              </div>

              {/* Guests */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FiUsers />
                  <span>Guests</span>
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-colors">
                  <button
                    type="button"
                    onClick={() => setSearchParams({ ...searchParams, guests: Math.max(1, searchParams.guests - 1) })}
                    className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={searchParams.guests}
                    onChange={(e) => setSearchParams({ ...searchParams, guests: parseInt(e.target.value) || 1 })}
                    className="w-full px-2 py-2 text-center border-0 focus:ring-0 bg-transparent text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchParams({ ...searchParams, guests: Math.min(20, searchParams.guests + 1) })}
                    className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                className="btn-primary px-8 py-3 flex items-center space-x-2"
              >
                <FiSearch />
                <span>Search Properties</span>
              </button>
            </div>
          </form>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold">500+</div>
            <div className="text-lg opacity-90">Properties Listed</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold">98%</div>
            <div className="text-lg opacity-90">Guest Satisfaction</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold">24/7</div>
            <div className="text-lg opacity-90">Customer Support</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;