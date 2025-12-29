// Save this as backend/test-associations.js
// Run with: node backend/test-associations.js

const { sequelize, User, Property, Booking, Payment } = require('./models');

async function testAssociations() {
  try {
    console.log('🔍 Testing Database Associations...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    // Check if tables exist
    console.log('📊 Checking tables...');
    const [tables] = await sequelize.query("SHOW TABLES");
    console.log('Available tables:', tables.map(t => Object.values(t)[0]));
    console.log('');
    
    // Test associations
    console.log('🔗 Testing model associations...\n');
    
    console.log('User associations:', Object.keys(User.associations));
    console.log('Property associations:', Object.keys(Property.associations));
    console.log('Booking associations:', Object.keys(Booking.associations));
    console.log('Payment associations:', Object.keys(Payment.associations));
    console.log('');
    
    // Test simple queries
    console.log('📋 Testing simple queries...\n');
    
    const userCount = await User.count();
    console.log(`Users: ${userCount}`);
    
    const propertyCount = await Property.count();
    console.log(`Properties: ${propertyCount}`);
    
    const bookingCount = await Booking.count();
    console.log(`Bookings: ${bookingCount}`);
    
    const paymentCount = await Payment.count();
    console.log(`Payments: ${paymentCount}`);
    console.log('');
    
    // Test Payment with Booking include
    console.log('🧪 Testing Payment with Booking include...');
    try {
      const payments = await Payment.findAll({
        include: [{
          model: Booking,
          as: 'booking',
          required: false
        }],
        limit: 1
      });
      console.log('✅ Payment->Booking include works');
      if (payments.length > 0) {
        console.log('Sample payment:', JSON.stringify(payments[0], null, 2));
      }
    } catch (err) {
      console.error('❌ Payment->Booking include failed:', err.message);
    }
    console.log('');
    
    // Test Payment with nested includes
    console.log('🧪 Testing Payment with nested includes...');
    try {
      const payments = await Payment.findAll({
        include: [{
          model: Booking,
          as: 'booking',
          required: false,
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
              attributes: ['id', 'name']
            }
          ]
        }],
        limit: 1
      });
      console.log('✅ Payment with nested includes works');
      if (payments.length > 0) {
        console.log('Sample payment with details:', JSON.stringify(payments[0], null, 2));
      }
    } catch (err) {
      console.error('❌ Payment with nested includes failed:', err.message);
      console.error('Full error:', err);
    }
    
    console.log('\n✅ Association test complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testAssociations();