const { User, Property, Booking, Payment, Review, sequelize } = require('../models');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
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

    if (role) user.role = role;
    if (verified !== undefined) user.verified = verified;

    await user.save();

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
    console.error('Error in updateUserRole:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPendingProperties = async (req, res) => {
  try {
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

    res.json({
      success: true,
      properties
    });
  } catch (error) {
    console.error('Error in getPendingProperties:', error);
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

    if (status) property.status = status;
    if (verified_badge !== undefined) property.verified_badge = verified_badge;

    await property.save();

    res.json({
      success: true,
      property
    });
  } catch (error) {
    console.error('Error in updatePropertyStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalBookings,
      totalRevenue
    ] = await Promise.all([
      User.count(),
      Property.count({ where: { status: 'approved' } }),
      Booking.count({ where: { status: 'confirmed' } }),
      Payment.sum('amount', { where: { status: 'completed' } })
    ]);

    // Recent bookings
    const recentBookings = await Booking.findAll({
      include: [
        {
          model: Property,
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

    // Monthly revenue
    const monthlyRevenue = await Payment.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('payment_date'), '%Y-%m'), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where: { status: 'completed' },
      group: ['month'],
      order: [['month', 'DESC']],
      limit: 6
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProperties,
        totalBookings,
        totalRevenue: totalRevenue || 0
      },
      recentBookings,
      monthlyRevenue
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: Booking,
          include: [
            {
              model: Property,
              attributes: ['id', 'title']
            },
            {
              model: User,
              as: 'guest',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['payment_date', 'DESC']]
    });

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error in getAllPayments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  getPendingProperties,
  updatePropertyStatus,
  getDashboardStats,
  getAllPayments
};