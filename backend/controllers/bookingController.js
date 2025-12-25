const { Booking, Property, User, Payment } = require('../models');
const { Op } = require('sequelize');

const createBooking = async (req, res) => {
  try {
    const {
      property_id,
      start_date,
      end_date,
      guests,
      special_requests
    } = req.body;

    const property = await Property.findByPk(property_id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Calculate total price
    const nights = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24));
    const total_price = property.price_per_night * nights;

    const booking = await Booking.create({
      property_id,
      guest_id: req.user.id,
      start_date,
      end_date,
      total_price,
      guests,
      special_requests,
      status: 'pending'
    });

    // Create payment record
    await Payment.create({
      booking_id: booking.id,
      amount: total_price,
      payment_method: 'pending',
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error in createBooking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { guest_id: req.user.id },
      include: [
        {
          model: Property,
          attributes: ['id', 'title', 'location', 'images', 'price_per_night']
        },
        {
          model: Payment,
          attributes: ['id', 'amount', 'status', 'payment_method']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error in getMyBookings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getHostBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        {
          model: Property,
          where: { host_id: req.user.id },
          attributes: ['id', 'title', 'location']
        },
        {
          model: User,
          as: 'guest',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Payment,
          attributes: ['id', 'amount', 'status']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error in getHostBookings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id, {
      include: [{
        model: Property
      }]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is host or admin
    if (booking.Property.host_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error in updateBookingStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the guest who made booking
    if (booking.guest_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Update payment status
    const payment = await Payment.findOne({ where: { booking_id: booking.id } });
    if (payment) {
      payment.status = 'refunded';
      await payment.save();
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getHostBookings,
  updateBookingStatus,
  cancelBooking
};