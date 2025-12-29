const { User, Property, Booking, Payment, Review, sequelize } = require('../models');

const getAllUsers = async (req, res) => {
  try {
    console.log('📋 Fetching all users...');
    
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    console.log(`✅ Found ${users.length} users`);

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('❌ Error in getAllUsers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role, verified } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate role if provided
    const validRoles = ['guest', 'host', 'admin', 'payment_manager', 'field_inspector'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (role) user.role = role;
    if (verified !== undefined) user.verified = verified;

    await user.save();

    console.log(`✅ Updated user ${user.id}: role=${user.role}, verified=${user.verified}`);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('❌ Error in updateUserRole:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting yourself
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await user.destroy();

    console.log(`✅ Deleted user ${req.params.id}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error in deleteUser:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllProperties = async (req, res) => {
  try {
    console.log('📋 Fetching all properties...');
    
    const properties = await Property.findAll({
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    console.log(`✅ Found ${properties.length} properties`);

    res.json({
      success: true,
      properties
    });
  } catch (error) {
    console.error('❌ Error in getAllProperties:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPendingProperties = async (req, res) => {
  try {
    console.log('📋 Fetching pending properties...');
    
    const properties = await Property.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    console.log(`✅ Found ${properties.length} pending properties`);

    res.json({
      success: true,
      properties
    });
  } catch (error) {
    console.error('❌ Error in getPendingProperties:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updatePropertyStatus = async (req, res) => {
  try {
    const { status, verified_badge } = req.body;
    const property = await Property.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'host',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Validate status if provided
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (status) property.status = status;
    if (verified_badge !== undefined) property.verified_badge = verified_badge;

    await property.save();

    console.log(`✅ Updated property ${property.id}: status=${property.status}`);

    res.json({
      success: true,
      property
    });
  } catch (error) {
    console.error('❌ Error in updatePropertyStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await property.destroy();

    console.log(`✅ Deleted property ${req.params.id}`);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error in deleteProperty:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats...');
    
    // Basic counts with error handling
    const [
      totalUsers,
      totalProperties,
      totalBookings,
      totalRevenue
    ] = await Promise.all([
      User.count().catch(err => {
        console.error('Error counting users:', err);
        return 0;
      }),
      Property.count({ where: { status: 'approved' } }).catch(err => {
        console.error('Error counting properties:', err);
        return 0;
      }),
      Booking.count({ where: { status: 'confirmed' } }).catch(err => {
        console.error('Error counting bookings:', err);
        return 0;
      }),
      Payment.sum('amount', { where: { status: 'completed' } }).catch(err => {
        console.error('Error summing payments:', err);
        return 0;
      })
    ]);

    console.log('✅ Basic stats retrieved:', { totalUsers, totalProperties, totalBookings, totalRevenue });

    // Recent bookings with proper aliases
    let recentBookings = [];
    try {
      recentBookings = await Booking.findAll({
        include: [
          {
            model: Property,
            as: 'property', // ✅ Fixed: use the alias
            attributes: ['id', 'title']
          },
          {
            model: User,
            as: 'guest',
            attributes: ['id', 'name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 10
      });
      console.log(`✅ Found ${recentBookings.length} recent bookings`);
    } catch (bookingError) {
      console.error('❌ Error fetching recent bookings:', bookingError);
      recentBookings = [];
    }

    // Monthly revenue - database agnostic approach
    let monthlyRevenue = [];
    try {
      // Get all completed payments from last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const payments = await Payment.findAll({
        attributes: ['amount', 'payment_date'],
        where: { 
          status: 'completed',
          payment_date: {
            [sequelize.Op.gte]: sixMonthsAgo
          }
        },
        raw: true
      });

      // Group by month in JavaScript (database agnostic)
      const revenueByMonth = {};
      payments.forEach(payment => {
        if (payment.payment_date) {
          const date = new Date(payment.payment_date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!revenueByMonth[monthKey]) {
            revenueByMonth[monthKey] = 0;
          }
          revenueByMonth[monthKey] += parseFloat(payment.amount);
        }
      });

      // Convert to array format
      monthlyRevenue = Object.entries(revenueByMonth)
        .map(([month, total]) => ({ month, total }))
        .sort((a, b) => b.month.localeCompare(a.month))
        .slice(0, 6);

      console.log(`✅ Monthly revenue calculated for ${monthlyRevenue.length} months`);
    } catch (revenueError) {
      console.error('❌ Error calculating monthly revenue:', revenueError);
      monthlyRevenue = [];
    }

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalProperties: totalProperties || 0,
        totalBookings: totalBookings || 0,
        totalRevenue: parseFloat(totalRevenue) || 0
      },
      recentBookings: recentBookings || [],
      monthlyRevenue: monthlyRevenue || []
    });

    console.log('✅ Dashboard stats sent successfully');
  } catch (error) {
    console.error('❌ Error in getDashboardStats:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    console.log('📋 Fetching all bookings...');
    
    const bookings = await Booking.findAll({
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'location']
        },
        {
          model: User,
          as: 'guest',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    console.log(`✅ Found ${bookings.length} bookings`);

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('❌ Error in getAllBookings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    booking.status = status;
    await booking.save();

    console.log(`✅ Updated booking ${booking.id} status to ${status}`);

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('❌ Error in updateBookingStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    console.log('📋 Fetching all payments...');
    
    // First, try with full includes
    let payments;
    try {
      payments = await Payment.findAll({
        include: [
          {
            model: Booking,
            as: 'booking',
            required: false, // ✅ LEFT JOIN - include payments even without booking
            include: [
              {
                model: Property,
                as: 'property',
                required: false,
                attributes: ['id', 'title']
              },
              {
                model: User,
                as: 'guest',
                required: false,
                attributes: ['id', 'name', 'email']
              }
            ]
          }
        ],
        order: [['payment_date', 'DESC']]
      });
      console.log(`✅ Found ${payments.length} payments with full details`);
    } catch (includeError) {
      console.error('❌ Error with includes, trying simple query:', includeError);
      
      // Fallback: Get payments without includes
      payments = await Payment.findAll({
        order: [['payment_date', 'DESC']]
      });
      console.log(`✅ Found ${payments.length} payments (simplified)`);
    }

    res.json({
      success: true,
      payments: payments || []
    });
  } catch (error) {
    console.error('❌ Error in getAllPayments:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllProperties,
  getPendingProperties,
  updatePropertyStatus,
  deleteProperty,
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  getAllPayments
};