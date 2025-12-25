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
    
    // Handle verified_badge filter
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
        },
        {
          model: Review,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'profile_image']
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Calculate average rating
    const reviews = await Review.findAll({
      where: { property_id: property.id },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
      ]
    });

    const averageRating = reviews[0]?.dataValues?.averageRating || 0;

    res.json({
      success: true,
      property: {
        ...property.toJSON(),
        averageRating: parseFloat(averageRating).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Error in getPropertyById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create property
const createProperty = async (req, res) => {
  try {
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

    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const property = await Property.create({
      host_id: req.user.id,
      title,
      description,
      location,
      address,
      price_per_night,
      bedrooms,
      bathrooms,
      max_guests,
      amenities: amenities ? JSON.parse(amenities) : [],
      images,
      latitude,
      longitude,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });

    res.status(201).json({
      success: true,
      property
    });
  } catch (error) {
    console.error('Error in createProperty:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = req.body;
    if (updates.amenities) {
      updates.amenities = JSON.parse(updates.amenities);
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      updates.images = [...property.images, ...newImages];
    }

    await property.update(updates);

    res.json({
      success: true,
      property
    });
  } catch (error) {
    console.error('Error in updateProperty:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
      return res.status(403).json({ message: 'Not authorized' });
    }

    await property.destroy();

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteProperty:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get my properties
const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      where: { host_id: req.user.id },
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      properties
    });
  } catch (error) {
    console.error('Error in getMyProperties:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export all functions
module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties
};