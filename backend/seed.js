require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Property, Booking, Review, Payment } = require('./models');

const seedDatabase = async () => {
  try {
    // Sync all models
    await sequelize.sync({ force: true });
    console.log('✅ Database synced!');

    // Create admin user - password: admin123
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@shortstay.com',
      password: adminPassword,
      role: 'admin',
      verified: true,
      phone: '+94 77 123 4567',
      address: 'University of Sri Jayewardenepura',
      profile_image: 'https://randomuser.me/api/portraits/men/1.jpg'
    });

    // Create host user - password: host123
    const hostPassword = await bcrypt.hash('host123', 10);
    const host = await User.create({
      name: 'John Host',
      email: 'host@example.com',
      password: hostPassword,
      role: 'host',
      verified: true,
      phone: '+94 76 987 6543',
      address: 'Colombo, Sri Lanka',
      profile_image: 'https://randomuser.me/api/portraits/men/2.jpg'
    });

    // Create guest user - password: guest123
    const guestPassword = await bcrypt.hash('guest123', 10);
    const guest = await User.create({
      name: 'Sarah Guest',
      email: 'guest@example.com',
      password: guestPassword,
      role: 'guest',
      verified: true,
      phone: '+94 71 456 7890',
      address: 'Kandy, Sri Lanka',
      profile_image: 'https://randomuser.me/api/portraits/women/1.jpg'
    });

    console.log('✅ Users created!');

    // Create sample properties
    const properties = [
      {
        host_id: host.id,
        title: 'Beachfront Villa in Galle',
        description: 'Beautiful villa with ocean view, perfect for families. 3 bedrooms, 2 bathrooms, fully equipped kitchen, and private pool.',
        location: 'Galle',
        address: '123 Beach Road, Galle Fort, Galle',
        price_per_night: 25000.00,
        bedrooms: 3,
        bathrooms: 2,
        max_guests: 6,
        amenities: JSON.stringify(['WiFi', 'Pool', 'Air Conditioning', 'Kitchen', 'Free Parking', 'TV', 'Washer']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]),
        status: 'approved',
        verified_badge: true,
        latitude: 6.0333,
        longitude: 80.2167
      },
      {
        host_id: host.id,
        title: 'Modern Apartment in Colombo',
        description: 'City center apartment with all modern amenities. Great view, security, and close to all attractions.',
        location: 'Colombo',
        address: '45 Main Street, Colombo 03',
        price_per_night: 12000.00,
        bedrooms: 2,
        bathrooms: 1,
        max_guests: 4,
        amenities: JSON.stringify(['WiFi', 'Air Conditioning', 'TV', 'Kitchen', 'Gym', 'Security']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]),
        status: 'approved',
        verified_badge: true,
        latitude: 6.9271,
        longitude: 79.8612
      },
      {
        host_id: host.id,
        title: 'Hill Country Bungalow in Nuwara Eliya',
        description: 'Cozy bungalow with fireplace, perfect for cool weather. Tea plantation views.',
        location: 'Nuwara Eliya',
        address: '78 Tea Estate Road, Nuwara Eliya',
        price_per_night: 15000.00,
        bedrooms: 2,
        bathrooms: 1,
        max_guests: 4,
        amenities: JSON.stringify(['Fireplace', 'WiFi', 'Kitchen', 'Parking', 'Garden']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]),
        status: 'approved',
        verified_badge: false,
        latitude: 6.9497,
        longitude: 80.7891
      }
    ];

    for (const propertyData of properties) {
      await Property.create(propertyData);
    }

    console.log('✅ Properties created!');

    // Create sample bookings
    const property1 = await Property.findOne({ where: { title: 'Beachfront Villa in Galle' } });
    const property2 = await Property.findOne({ where: { title: 'Modern Apartment in Colombo' } });

    const bookings = [
      {
        property_id: property1.id,
        guest_id: guest.id,
        start_date: new Date('2024-03-15'),
        end_date: new Date('2024-03-20'),
        total_price: 125000.00,
        guests: 4,
        status: 'confirmed',
        special_requests: 'Early check-in if possible'
      },
      {
        property_id: property2.id,
        guest_id: guest.id,
        start_date: new Date('2024-04-01'),
        end_date: new Date('2024-04-05'),
        total_price: 48000.00,
        guests: 2,
        status: 'completed',
        special_requests: 'Need baby cot'
      }
    ];

    for (const bookingData of bookings) {
      await Booking.create(bookingData);
    }

    console.log('✅ Bookings created!');

    // Create sample payments
    const booking1 = await Booking.findOne({ where: { property_id: property1.id } });
    const booking2 = await Booking.findOne({ where: { property_id: property2.id } });

    const payments = [
      {
        booking_id: booking1.id,
        amount: 125000.00,
        payment_method: 'credit_card',
        status: 'completed',
        transaction_id: 'TXN_' + Date.now() + '_001'
      },
      {
        booking_id: booking2.id,
        amount: 48000.00,
        payment_method: 'bank_transfer',
        status: 'completed',
        transaction_id: 'TXN_' + Date.now() + '_002'
      }
    ];

    for (const paymentData of payments) {
      await Payment.create(paymentData);
    }

    console.log('✅ Payments created!');

    // Create sample reviews
    const reviews = [
      {
        property_id: property1.id,
        user_id: guest.id,
        booking_id: booking1.id,
        rating: 5,
        comment: 'Amazing villa with stunning views! Host was very responsive and helpful. Highly recommended!'
      },
      {
        property_id: property2.id,
        user_id: guest.id,
        booking_id: booking2.id,
        rating: 4,
        comment: 'Great location and comfortable apartment. Clean and well-maintained.'
      }
    ];

    for (const reviewData of reviews) {
      await Review.create(reviewData);
    }

    console.log('✅ Reviews created!');
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@shortstay.com / admin123');
    console.log('   Host:  host@example.com / host123');
    console.log('   Guest: guest@example.com / guest123');
    console.log('\n🔑 Passwords are properly hashed and will work with login.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();