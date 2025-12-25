import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiMapPin, FiUsers, FiHome } from 'react-icons/fi';
import { formatCurrency } from '../utils/format';

const PropertyCard = ({ property }) => {
  const averageRating = property.averageRating || 4.5;
  const imageUrl = property.images?.[0] || 'https://via.placeholder.com/400x300';

  return (
    <div className="card overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {property.verified_badge && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Verified
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <span className="font-bold text-primary-600">{formatCurrency(property.price_per_night)}</span>
          <span className="text-xs text-gray-600">/night</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg truncate">{property.title}</h3>
          <div className="flex items-center space-x-1">
            <FiStar className="text-yellow-400 fill-current" />
            <span className="font-medium">{averageRating}</span>
          </div>
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <FiMapPin className="mr-1" />
          <span className="truncate">{property.location}</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FiHome className="mr-1" />
              <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center">
              <FiUsers className="mr-1" />
              <span>{property.max_guests} guests</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={property.User?.profile_image || 'https://via.placeholder.com/32'}
              alt={property.User?.name}
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="text-sm font-medium">{property.User?.name}</span>
          </div>
          <Link
            to={`/properties/${property.id}`}
            className="btn-primary px-4 py-2 text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;