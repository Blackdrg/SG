-- Initial database schema for SpiceGarden
-- This script runs on first database initialization

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    restaurant_id UUID REFERENCES restaurants(id),
    status VARCHAR(50) DEFAULT 'pending',
    total DECIMAL(10, 2),
    items JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Insert test data for Internal Alpha
INSERT INTO restaurants (id, name, slug, address, phone) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Spice Garden - Downtown', 'downtown', 'Downtown Branch', '+1234567890'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Spice Garden - Mall Road', 'mall-road', 'Mall Road Branch', '+1234567891'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Spice Garden - Gulshan', 'gulshan', 'Gulshan Branch', '+1234567892')
ON CONFLICT DO NOTHING;

-- Create Sentry database and user
CREATE DATABASE sentry OWNER spicegarden;
CREATE USER sentry WITH PASSWORD 'sentry';
GRANT ALL PRIVILEGES ON DATABASE sentry TO sentry;