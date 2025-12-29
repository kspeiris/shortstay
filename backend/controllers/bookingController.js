const { Booking, Property, User, Payment } = require('../models');
const { Op } = require('sequelize');

// ========================================
// CREATE BOOKING
// ========================================
const createBooking = async (req, res) => {
  try {
    const { property_id, start_date, end_date, guests, total_price } = req.body;

    // Validate required fields
    if (!property_id || !start_date || !end_date || !total_price) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['property_id', 'start_date', 'end_date', 'total_price']
      });
    }

    // Check if property exists
    const property = await Property.findByPk(property_id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      where: {
        property_id,
        status: { [Op.in]: ['pending', 'confirmed'] },
        [Op.or]: [
          {
            start_date: { [Op.between]: [start_date, end_date] }
          },
          {
            end_date: { [Op.between]: [start_date, end_date] }
          },
          {
            [Op.and]: [
              { start_date: { [Op.lte]: start_date } },
              { end_date: { [Op.gte]: end_date } }
            ]
          }
        ]
      }
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Property is not available for selected dates' });
    }

    // Create booking
    const booking = await Booking.create({
      guest_id: req.user.id,
      property_id,
      start_date,
      end_date,
      guests: guests || property.max_guests,
      total_price,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });

  } catch (error) {
    console.error('❌ Error in createBooking:', error);
    res.status(500).json({ 
      message: 'Failed to create booking',
      error: error.message 
    });
  }
};

// ========================================
// GET MY BOOKINGS (Guest View)
// ========================================
const getMyBookings = async (req, res) => {
  console.log('========================================');
  console.log('📋 GET MY BOOKINGS CALLED');
  console.log('========================================');
  
  try {
    console.log('Step 1: Checking user');
    if (!req.user) {
      console.error('❌ No user in request');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    console.log('Step 2: User ID:', req.user.id);
    console.log('Step 3: Starting database query...');

    const bookings = await Booking.findAll({
      where: { guest_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    console.log('Step 4: Query successful, found:', bookings.length);

    res.json({
      success: true,
      bookings: bookings.map(b => b.toJSON()),
      count: bookings.length
    });

  } catch (error) {
    console.error('========================================');
    console.error('❌ ERROR IN getMyBookings');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('========================================');
    
    res.status(500).json({ 
      message: 'Failed to fetch bookings',
      error: error.message,
      details: error.stack
    });
  }
};

// ========================================
// GET HOST BOOKINGS
// ========================================
const getHostBookings = async (req, res) => {
  try {
    console.log('📋 Fetching bookings for host:', req.user.id);

    // Get properties owned by host
    const hostProperties = await Property.findAll({
      where: { host_id: req.user.id },
      attributes: ['id']
    });

    const propertyIds = hostProperties.map(p => p.id);

    if (propertyIds.length === 0) {
      console.log('ℹ️ Host has no properties');
      return res.json({
        success: true,
        bookings: [],
        count: 0
      });
    }

    // Get bookings for these properties
    const bookings = await Booking.findAll({
      where: { property_id: propertyIds },
      include: [
        {
          model: Property,
          as: 'property',  // ✅ lowercase
          attributes: ['id', 'title', 'location', 'images']
        },
        {
          model: User,
          as: 'guest',  // ✅ lowercase
          attributes: ['id', 'name', 'email', 'phone', 'profile_image']
        },
        {
          model: Payment,
          as: 'payment',  // ✅ lowercase
          attributes: ['id', 'amount', 'payment_method', 'status'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    console.log(`✅ Found ${bookings.length} bookings for host properties`);

    res.json({
      success: true,
      bookings: bookings.map(b => b.toJSON()),
      count: bookings.length
    });

  } catch (error) {
    console.error('❌ Error in getHostBookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch host bookings',
      error: error.message
    });
  }
};

// ========================================
// GET BOOKING BY ID
// ========================================
const getById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        {
          model: Property,
          as: 'property',  // ✅ lowercase
          include: [
            {
              model: User,
              as: 'host',
              attributes: ['id', 'name', 'email', 'phone']
            }
          ]
        },
        {
          model: User,
          as: 'guest',  // ✅ lowercase
          attributes: ['id', 'name', 'email', 'phone', 'profile_image']
        },
        {
          model: Payment,
          as: 'payment',  // ✅ lowercase
          required: false
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (
      booking.guest_id !== req.user.id &&
      booking.property.host_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json({
      success: true,
      booking: booking.toJSON()
    });

  } catch (error) {
    console.error('❌ Error in getById:', error);
    res.status(500).json({ 
      message: 'Failed to fetch booking',
      error: error.message 
    });
  }
};

// ========================================
// CANCEL BOOKING
// ========================================
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Property, as: 'property' }]  // ✅ lowercase
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (
      booking.guest_id !== req.user.id &&
      booking.property.host_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ 
        message: `Cannot cancel a ${booking.status} booking` 
      });
    }

    await booking.update({ status: 'cancelled' });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: booking.toJSON()
    });

  } catch (error) {
    console.error('❌ Error in cancelBooking:', error);
    res.status(500).json({ 
      message: 'Failed to cancel booking',
      error: error.message 
    });
  }
};

// ========================================
// UPDATE BOOKING STATUS
// ========================================
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status',
        validStatuses 
      });
    }

    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Property, as: 'property' }]  // ✅ lowercase
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (
      booking.property.host_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ 
        message: 'Not authorized to update this booking' 
      });
    }

    await booking.update({ status });

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: booking.toJSON()
    });

  } catch (error) {
    console.error('❌ Error in updateStatus:', error);
    res.status(500).json({ 
      message: 'Failed to update booking status',
      error: error.message 
    });
  }
};

// ========================================
// GET PROPERTY BOOKINGS
// ========================================
const getPropertyBookings = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check if property exists and user has access
    const property = await Property.findByPk(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (
      property.host_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ 
        message: 'Not authorized to view bookings for this property' 
      });
    }

    const bookings = await Booking.findAll({
      where: { property_id: propertyId },
      include: [
        {
          model: User,
          as: 'guest',  // ✅ lowercase
          attributes: ['id', 'name', 'email', 'phone', 'profile_image']
        },
        {
          model: Payment,
          as: 'payment',  // ✅ lowercase
          attributes: ['id', 'amount', 'payment_method', 'status'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      bookings: bookings.map(b => b.toJSON()),
      count: bookings.length
    });

  } catch (error) {
    console.error('❌ Error in getPropertyBookings:', error);
    res.status(500).json({ 
      message: 'Failed to fetch property bookings',
      error: error.message 
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getHostBookings,
  getById,
  cancelBooking,
  updateStatus,
  getPropertyBookings
};