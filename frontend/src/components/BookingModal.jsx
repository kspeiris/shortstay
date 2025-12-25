import React, { useState } from 'react';
import { FiX, FiCalendar, FiUsers, FiDollarSign } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import { formatCurrency } from '../utils/format';
import { bookingAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const BookingModal = ({ property, isOpen, onClose }) => {
  const [bookingData, setBookingData] = useState({
    start_date: null,
    end_date: null,
    guests: 1,
    special_requests: '',
  });
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    if (!bookingData.start_date || !bookingData.end_date) return 0;
    const nights = Math.ceil((bookingData.end_date - bookingData.start_date) / (1000 * 60 * 60 * 24));
    return nights * property.price_per_night;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookingData.start_date || !bookingData.end_date) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (bookingData.guests > property.max_guests) {
      toast.error(`Maximum ${property.max_guests} guests allowed`);
      return;
    }

    setLoading(true);
    try {
      await bookingAPI.create({
        property_id: property.id,
        ...bookingData,
        start_date: bookingData.start_date.toISOString().split('T')[0],
        end_date: bookingData.end_date.toISOString().split('T')[0],
      });
      toast.success('Booking request sent successfully!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Book {property.title}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium">
                      <FiCalendar />
                      <span>Check-in</span>
                    </label>
                    <DatePicker
                      selected={bookingData.start_date}
                      onChange={(date) => setBookingData({...bookingData, start_date: date})}
                      minDate={new Date()}
                      placeholderText="Select date"
                      className="input-field"
                      dateFormat="MMM dd, yyyy"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium">
                      <FiCalendar />
                      <span>Check-out</span>
                    </label>
                    <DatePicker
                      selected={bookingData.end_date}
                      onChange={(date) => setBookingData({...bookingData, end_date: date})}
                      minDate={bookingData.start_date || new Date()}
                      placeholderText="Select date"
                      className="input-field"
                      dateFormat="MMM dd, yyyy"
                      required
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium">
                    <FiUsers />
                    <span>Guests</span>
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setBookingData({...bookingData, guests: Math.max(1, bookingData.guests - 1)})}
                      className="px-3 py-2 text-gray-600 hover:text-primary-600"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={property.max_guests}
                      value={bookingData.guests}
                      onChange={(e) => setBookingData({...bookingData, guests: parseInt(e.target.value) || 1})}
                      className="w-full px-2 py-2 text-center border-0 focus:ring-0"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setBookingData({...bookingData, guests: Math.min(property.max_guests, bookingData.guests + 1)})}
                      className="px-3 py-2 text-gray-600 hover:text-primary-600"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Maximum {property.max_guests} guests
                  </p>
                </div>

                {/* Special Requests */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Special Requests (Optional)</label>
                  <textarea
                    value={bookingData.special_requests}
                    onChange={(e) => setBookingData({...bookingData, special_requests: e.target.value})}
                    className="input-field h-24"
                    placeholder="Any special requirements or requests..."
                  />
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nightly rate</span>
                    <span>{formatCurrency(property.price_per_night)}</span>
                  </div>
                  {bookingData.start_date && bookingData.end_date && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {Math.ceil((bookingData.end_date - bookingData.start_date) / (1000 * 60 * 60 * 24))} nights
                        </span>
                        <span>{formatCurrency(calculateTotal())}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span className="text-primary-600">{formatCurrency(calculateTotal())}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !bookingData.start_date || !bookingData.end_date}
                  className="btn-primary w-full py-3 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FiDollarSign className="mr-2" />
                      Request to Book
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  You won't be charged until the host confirms your booking
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;