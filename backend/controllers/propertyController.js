const { Property, User, Review, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all properties
const getAllProperties = async (req, res) => {
  try {
    const {
      location,
      minPrice,
      maxPrice,
      bedrooms,
      guests,
      page = 1,
      limit = 10,
      verified_badge
    } = req.query;

    const where = { status: 'approved' };

    if (location) {
      where.location = { [Op.like]: `%${location}%` };
    }

    if (minPrice || maxPrice) {
      where.price_per_night = {};
      if (minPrice) where.price_per_night[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price_per_night[Op.lte] = parseFloat(maxPrice);
    }

    if (bedrooms) where.bedrooms = parseInt(bedrooms);
    if (guests) where.max_guests = { [Op.gte]: parseInt(guests) };

    if (verified_badge !== undefined) {
      where.verified_badge = verified_badge === 'true' || verified_badge === true;
    }

    const offset = (page - 1) * limit;

    const { count, rows: properties } = await Property.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'name', 'profile_image']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    // Calculate average ratings for each property
    const propertiesWithRatings = await Promise.all(
      properties.map(async (property) => {
        const reviews = await Review.findAll({
          where: { property_id: property.id },
          attributes: [
            [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount']
          ]
        });

        const averageRating = reviews[0]?.dataValues?.averageRating || 0;
        const reviewCount = reviews[0]?.dataValues?.reviewCount || 0;

        return {
          ...property.toJSON(),
          averageRating: parseFloat(averageRating).toFixed(1),
          reviewCount
        };
      })
    );

    res.json({
      success: true,
      properties: propertiesWithRatings,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Error in getAllProperties:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get property by ID
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'name', 'phone', 'email', 'profile_image']
        }
      ]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Fetch reviews separately
    const reviews = await Review.findAll({
      where: { property_id: property.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profile_image']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate average rating
    const ratingStats = await Review.findAll({
      where: { property_id: property.id },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
      ]
    });

    const averageRating = ratingStats[0]?.dataValues?.averageRating || 0;

    res.json({
      success: true,
      property: {
        ...property.toJSON(),
        reviews: reviews,
        averageRating: parseFloat(averageRating).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Error in getPropertyById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create property - COMPREHENSIVE FIX
const createProperty = async (req, res) => {
  try {
    console.log('═══════════════════════════════════════');
    console.log('📥 CREATE PROPERTY REQUEST');
    console.log('═══════════════════════════════════════');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Files:', req.files);
    console.log('User:', req.user);
    console.log('═══════════════════════════════════════');

    // ✅ FIX 1: Check authentication FIRST
    if (!req.user || !req.user.id) {
      console.error('❌ Authentication failed - req.user:', req.user);
      return res.status(401).json({
        message: 'Authentication required. Please log in again.',
        debug: {
          hasUser: !!req.user,
          userId: req.user?.id
        }
      });
    }

    const {
      title,
      description,
      location,
      address,
      price_per_night,
      bedrooms,
      bathrooms,
      max_guests,
      amenities,
      latitude,
      longitude
    } = req.body;

    // ✅ FIX 2: Validate required fields with helpful messages
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!location) missingFields.push('location');
    if (!address) missingFields.push('address');
    if (!price_per_night) missingFields.push('price_per_night');

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        message: 'Missing required fields',
        missingFields,
        received: Object.keys(req.body)
      });
    }

    // ✅ FIX 3: Safely parse amenities (handle all formats)
    let parsedAmenities = [];
    if (amenities) {
      try {
        if (typeof amenities === 'string') {
          // Handle JSON string
          parsedAmenities = JSON.parse(amenities);
        } else if (Array.isArray(amenities)) {
          // Already an array
          parsedAmenities = amenities;
        } else {
          // Single value
          parsedAmenities = [String(amenities)];
        }
      } catch (e) {
        console.warn('⚠️ Failed to parse amenities, using as single value:', e.message);
        parsedAmenities = [String(amenities)];
      }
    }

    // ✅ FIX 4: Handle images with correct path format
    let images = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Use filename only (no leading slash) since uploads are served statically
      images = req.files.map(file => `uploads/${file.filename}`);
      console.log('📸 Uploaded images:', images);
    }

    // ✅ FIX 5: Ensure all numeric fields have valid defaults
    const propertyData = {
      host_id: req.user.id,
      title: String(title).trim(),
      description: String(description).trim(),
      location: String(location).trim(),
      address: String(address).trim(),
      price_per_night: parseFloat(price_per_night),
      bedrooms: bedrooms ? parseInt(bedrooms) : 1,
      bathrooms: bathrooms ? parseInt(bathrooms) : 1,
      max_guests: max_guests ? parseInt(max_guests) : 2,
      amenities: parsedAmenities, // Setter will convert to JSON string
      images: images,              // Setter will convert to JSON string
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    };

    console.log('📝 Creating property with data:', JSON.stringify(propertyData, null, 2));

    // ✅ FIX 6: Create with try-catch for Sequelize validation errors
    const property = await Property.create(propertyData);

    console.log('✅ Property created successfully:', property.id);

    // Return property with parsed JSON fields (getters handle this)
    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property: property.toJSON()
    });

  } catch (error) {
    console.error('═══════════════════════════════════════');
    console.error('❌ ERROR IN createProperty');
    console.error('═══════════════════════════════════════');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);

    // ✅ FIX 7: Handle Sequelize validation errors specifically
    if (error.name === 'SequelizeValidationError') {
      console.error('Validation Errors:', error.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      })));

      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }

    // ✅ FIX 8: Handle database constraint errors
    if (error.name === 'SequelizeDatabaseError') {
      console.error('Database Error:', error.message);
      return res.status(400).json({
        message: 'Database error',
        error: error.message
      });
    }

    // Generic error
    console.error('Stack:', error.stack);
    console.error('═══════════════════════════════════════');

    res.status(500).json({
      message: 'Failed to create property',
      error: error.message,
      debug: {
        errorType: error.name,
        hasUser: !!req.user,
        hasFiles: !!req.files,
        bodyKeys: Object.keys(req.body)
      }
    });
  }
};

// Update property
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership or admin access
    if (property.host_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const updates = { ...req.body };

    // ✅ FIX: Force status to 'pending' if host updates sensitive fields (requires re-approval)
    const sensitiveFields = ['title', 'description', 'price_per_night', 'location', 'address', 'bedrooms', 'bathrooms', 'max_guests'];
    const updatedSensitiveFields = sensitiveFields.filter(field => updates[field] !== undefined && String(updates[field]) !== String(property[field]));

    if (req.user.role !== 'admin' && updatedSensitiveFields.length > 0) {
      console.log(`🔄 Property updates detected in sensitive fields: ${updatedSensitiveFields.join(', ')}. Status reverted to pending.`);
      updates.status = 'pending';
    }

    // Parse amenities safely if provided
    if (updates.amenities) {
      try {
        if (typeof updates.amenities === 'string') {
          updates.amenities = JSON.parse(updates.amenities);
        } else if (!Array.isArray(updates.amenities)) {
          updates.amenities = [updates.amenities];
        }
      } catch (e) {
        console.warn('Failed to parse amenities in update:', e.message);
        updates.amenities = [String(updates.amenities)];
      }
    }

    // Handle new images (append to existing)
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `uploads/${file.filename}`);
      const existingImages = property.images || [];
      updates.images = [...existingImages, ...newImages];
    }

    await property.update(updates);

    res.json({
      success: true,
      message: 'Property updated successfully',
      property: property.toJSON()
    });
  } catch (error) {
    console.error('Error in updateProperty:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }

    res.status(500).json({
      message: 'Failed to update property',
      error: error.message
    });
  }
};

// Delete property
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership or admin access
    if (property.host_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await property.destroy();

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteProperty:', error);
    res.status(500).json({
      message: 'Failed to delete property',
      error: error.message
    });
  }
};

// Get my properties
const getMyProperties = async (req, res) => {
  try {
    console.log('📋 Fetching properties for user:', req.user.id);

    const properties = await Property.findAll({
      where: { host_id: req.user.id },
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'name', 'profile_image']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    console.log(`✅ Found ${properties.length} properties`);

    res.json({
      success: true,
      count: properties.length,
      properties: properties.map(p => p.toJSON())
    });
  } catch (error) {
    console.error('Error in getMyProperties:', error);
    res.status(500).json({
      message: 'Failed to fetch properties',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties
};