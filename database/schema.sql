-- ShortStay Database Schema
-- Version: 1.0

-- Create database
CREATE DATABASE IF NOT EXISTS shortstay;
USE shortstay;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role ENUM('guest', 'host', 'admin', 'payment_manager', 'field_inspector') DEFAULT 'guest',
  verified BOOLEAN DEFAULT FALSE,
  profile_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  host_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(150) NOT NULL,
  address TEXT NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  bedrooms INT DEFAULT 1,
  bathrooms INT DEFAULT 1,
  max_guests INT DEFAULT 2,
  amenities TEXT,
  images TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  verified_badge BOOLEAN DEFAULT FALSE,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_location (location),
  INDEX idx_status (status),
  INDEX idx_price (price_per_night),
  INDEX idx_host (host_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  guest_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  guests INT DEFAULT 1,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_dates (start_date, end_date),
  INDEX idx_guest (guest_id),
  INDEX idx_property (property_id),
  INDEX idx_status (status),
  CHECK (start_date < end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  user_id INT NOT NULL,
  booking_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_property (property_id),
  INDEX idx_user (user_id),
  INDEX idx_rating (rating),
  UNIQUE KEY unique_booking_review (booking_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer') NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  transaction_id VARCHAR(100),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking (booking_id),
  INDEX idx_status (status),
  INDEX idx_transaction (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Property Inspections Table (For Field Inspectors)
CREATE TABLE IF NOT EXISTS property_inspections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  inspector_id INT NOT NULL,
  inspection_date DATE NOT NULL,
  status ENUM('pending', 'passed', 'failed') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('booking', 'payment', 'review', 'system') NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Admin User (password: admin123)
-- Note: Use bcrypt.hash('admin123', 10) to generate password hash
INSERT INTO users (name, email, password, role, verified) VALUES
('System Admin', 'admin@shortstay.com', '$2a$10$X6L6gJ/7ZqJp8q8q8q8q8.q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q', 'admin', TRUE);

-- Create a sample host (password: host123)
INSERT INTO users (name, email, password, role, verified, phone, address) VALUES
('John Host', 'host@example.com', '$2a$10$Y7M7hK/8ArKp9r9r9r9r9.s9s9s9s9s9s9s9s9s9s9s9s9s9s9s9s9', 'host', TRUE, '+94 77 123 4567', 'Colombo, Sri Lanka');

-- Create a sample guest (password: guest123)
INSERT INTO users (name, email, password, role, verified, phone, address) VALUES
('Sarah Guest', 'guest@example.com', '$2a$10$Z8N8iL/9BsLq0t0t0t0t0.t0t0t0t0t0t0t0t0t0t0t0t0t0t0t0t0', 'guest', TRUE, '+94 71 456 7890', 'Kandy, Sri Lanka');

-- Note: Replace the password hashes with actual bcrypt hashes in production