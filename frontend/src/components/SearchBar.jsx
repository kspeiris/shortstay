import React from 'react';
import { FiSearch, FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';

const SearchBar = () => {
  return (
    <div className="bg-white rounded-xl shadow-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <FiMapPin className="absolute left-4 top-4 text-gray-400" />
          <input
            type="text"
            placeholder="Where are you going?"
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <FiCalendar className="absolute left-4 top-4 text-gray-400" />
          <input
            type="text"
            placeholder="Check-in — Check-out"
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <FiUsers className="absolute left-4 top-4 text-gray-400" />
          <select className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option>2 Guests</option>
            <option>4 Guests</option>
            <option>6+ Guests</option>
          </select>
        </div>
        
        <button className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
          <FiSearch />
          <span>Search</span>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;