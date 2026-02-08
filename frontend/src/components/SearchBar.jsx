import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';

const SearchBar = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const handleSearch = (e) => {
    e.preventDefault();

    // Build query parameters
    const params = new URLSearchParams();

    if (location.trim()) {
      params.append('location', location.trim());
    }
    if (checkIn) {
      params.append('checkIn', checkIn);
    }
    if (checkOut) {
      params.append('checkOut', checkOut);
    }
    if (guests > 1) {
      params.append('guests', guests);
    }

    // Navigate to properties page with search params
    const queryString = params.toString();
    if (queryString) {
      navigate(`/properties?${queryString}`);
    } else {
      navigate('/properties');
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Where are you going?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 transition-colors"
          />
        </div>
      </div>
      <div className="flex-1">
        <div className="relative">
          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            placeholder="Check-in"
            className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white transition-colors"
          />
        </div>
      </div>
      <div className="flex-1">
        <div className="relative">
          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            placeholder="Check-out"
            className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white transition-colors"
          />
        </div>
      </div>
      <div className="flex-1">
        <div className="relative">
          <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="number"
            min="1"
            placeholder="Guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white transition-colors"
          />
        </div>
      </div>
      <button
        type="submit"
        className="px-8 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors font-semibold flex items-center justify-center"
      >
        <FiSearch className="inline mr-2" />
        Search
      </button>
    </form>
  );
};

export default SearchBar;