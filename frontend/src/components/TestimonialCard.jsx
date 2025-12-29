import React from 'react';
import { FiStar } from 'react-icons/fi';

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center mb-6">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-14 h-14 rounded-full object-cover mr-4"
        />
        <div>
          <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
          <p className="text-gray-500 text-sm">{testimonial.location}</p>
        </div>
      </div>
      
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`w-5 h-5 ${
              i < Math.floor(testimonial.rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 font-bold text-gray-700">{testimonial.rating}</span>
      </div>
      
      <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
      
      <div className="text-sm text-gray-500">{testimonial.date}</div>
    </div>
  );
};

export default TestimonialCard;