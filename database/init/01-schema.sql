-- Truck Repair Assistant Database Schema
-- This file will be automatically executed when the PostgreSQL container starts

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication (future feature)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    subscription_type VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trucks table
CREATE TABLE trucks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    vin VARCHAR(17) UNIQUE,
    mileage INTEGER,
    engine_type VARCHAR(50),
    transmission VARCHAR(50),
    usage_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Diagnostic sessions
CREATE TABLE diagnostic_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    truck_id UUID REFERENCES trucks(id) ON DELETE CASCADE,
    symptoms TEXT NOT NULL,
    ai_response JSONB,
    session_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'completed'
);

-- Maintenance records
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    truck_id UUID REFERENCES trucks(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    service_date DATE NOT NULL,
    mileage_at_service INTEGER,
    cost DECIMAL(10,2),
    service_provider VARCHAR(255),
    next_service_date DATE,
    next_service_mileage INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Service locations cache
CREATE TABLE service_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    phone VARCHAR(20),
    services TEXT[], -- Array of services offered
    rating DECIMAL(2,1),
    review_count INTEGER DEFAULT 0,
    hours TEXT,
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat conversations
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    truck_id UUID REFERENCES trucks(id) ON DELETE SET NULL,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Repair guides cache
CREATE TABLE repair_guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(50),
    duration VARCHAR(50),
    rating DECIMAL(2,1),
    video_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    content TEXT, -- For text-based guides
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_trucks_user_id ON trucks(user_id);
CREATE INDEX idx_trucks_vin ON trucks(vin);
CREATE INDEX idx_diagnostic_sessions_truck_id ON diagnostic_sessions(truck_id);
CREATE INDEX idx_maintenance_records_truck_id ON maintenance_records(truck_id);
CREATE INDEX idx_maintenance_records_service_date ON maintenance_records(service_date);
CREATE INDEX idx_service_locations_coordinates ON service_locations(latitude, longitude);
CREATE INDEX idx_chat_conversations_truck_id ON chat_conversations(truck_id);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_repair_guides_category ON repair_guides(category);

-- Create function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trucks_updated_at BEFORE UPDATE ON trucks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_locations_updated_at BEFORE UPDATE ON service_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON chat_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development
INSERT INTO users (email, password_hash, first_name, last_name) VALUES
('demo@truckrepair.com', '$2b$10$demo.hash.for.development', 'Demo', 'User');

-- Get the demo user ID for sample data
DO $$
DECLARE
    demo_user_id UUID;
    truck1_id UUID;
    truck2_id UUID;
    conv_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@truckrepair.com';
    
    -- Insert sample trucks
    INSERT INTO trucks (user_id, make, model, year, vin, mileage, engine_type, transmission, usage_type)
    VALUES 
        (demo_user_id, 'Freightliner', 'Cascadia', 2020, '1FUJGBDV4LLBXXXXX', 150000, 'diesel', 'automatic', 'heavy'),
        (demo_user_id, 'Peterbilt', '579', 2019, '1XPXDB9X5KD111111', 200000, 'diesel', 'manual', 'heavy')
    RETURNING id INTO truck1_id;
    
    SELECT id INTO truck2_id FROM trucks WHERE vin = '1XPXDB9X5KD111111';
    
    -- Insert sample maintenance records
    INSERT INTO maintenance_records (truck_id, service_type, description, service_date, mileage_at_service, cost, service_provider)
    VALUES 
        (truck1_id, 'Oil Change', 'Regular oil and filter change', CURRENT_DATE - INTERVAL '30 days', 148000, 250.00, 'Highway Service Center'),
        (truck1_id, 'Brake Inspection', 'Full brake system inspection and pad replacement', CURRENT_DATE - INTERVAL '60 days', 145000, 800.00, 'Truck Stop Repairs'),
        (truck2_id, 'Annual DOT Inspection', 'Department of Transportation safety inspection', CURRENT_DATE - INTERVAL '90 days', 195000, 150.00, 'Certified Inspection Station');
    
    -- Insert sample service locations
    INSERT INTO service_locations (name, address, latitude, longitude, phone, services, rating, review_count, hours)
    VALUES 
        ('Highway Truck Service', '1234 Interstate Blvd, Trucking City, TX 75001', 32.7767, -96.7970, '(555) 123-4567', ARRAY['Oil Change', 'Brake Repair', 'Engine Diagnostics'], 4.5, 150, 'Mon-Fri 6AM-10PM, Sat-Sun 8AM-6PM'),
        ('24/7 Emergency Repairs', '5678 Highway 35, Service Town, TX 75002', 32.8167, -96.8470, '(555) 987-6543', ARRAY['Emergency Repair', 'Towing', 'Mobile Service'], 4.2, 89, '24/7'),
        ('Fleet Maintenance Pro', '9012 Industrial Park Dr, Repair City, TX 75003', 32.7567, -96.7370, '(555) 456-7890', ARRAY['Preventive Maintenance', 'Fleet Service', 'DOT Inspections'], 4.8, 220, 'Mon-Fri 7AM-7PM');
        
    -- Insert sample repair guides
    INSERT INTO repair_guides (title, description, category, difficulty, duration, rating, video_url)
    VALUES 
        ('Semi Truck Oil Change Step-by-Step', 'Complete guide to changing oil in commercial trucks', 'maintenance', 'Beginner', '30 minutes', 4.8, 'https://youtube.com/watch?v=example1'),
        ('Diesel Engine Troubleshooting', 'Common diesel engine problems and solutions', 'engine', 'Intermediate', '45 minutes', 4.9, 'https://youtube.com/watch?v=example2'),
        ('Air Brake System Maintenance', 'How to maintain and repair air brake systems', 'brakes', 'Advanced', '60 minutes', 4.7, 'https://youtube.com/watch?v=example3');
END $$;
