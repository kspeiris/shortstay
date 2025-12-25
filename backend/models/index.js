const sequelize = require('../config/database');
const User = require('./User');
const Property = require('./Property');
const Booking = require('./Booking');
const Review = require('./Review');
const Payment = require('./Payment');

// Define relationships

// User has many Properties (as host)
User.hasMany(Property, { foreignKey: 'host_id', as: 'properties' });
Property.belongsTo(User, { foreignKey: 'host_id', as: 'host' });

// User has many Bookings (as guest)
User.hasMany(Booking, { foreignKey: 'guest_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'guest_id', as: 'guest' });

// Property has many Bookings
Property.hasMany(Booking, { foreignKey: 'property_id', as: 'bookings' });
Booking.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

// Property has many Reviews
Property.hasMany(Review, { foreignKey: 'property_id', as: 'reviews' });
Review.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

// User has many Reviews
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Booking has one Review
Booking.hasOne(Review, { foreignKey: 'booking_id', as: 'review' });
Review.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// Booking has one Payment
Booking.hasOne(Payment, { foreignKey: 'booking_id', as: 'payment' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// Sync database (with force: false in production)
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Use { force: false } to preserve data
    // Use { alter: true } to sync schema changes
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database synced successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  User,
  Property,
  Booking,
  Review,
  Payment,
  syncDatabase
};