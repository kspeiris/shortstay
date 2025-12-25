const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  host_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price_per_night: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  max_guests: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  amenities: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('amenities');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('amenities', JSON.stringify(value));
    }
  },
  images: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('images');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('images', JSON.stringify(value));
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  verified_badge: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'properties',
  timestamps: false
});

module.exports = Property;