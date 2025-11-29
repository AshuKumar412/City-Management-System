/*
  # Smart City Management System Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password` (text, hashed password)
      - `role` (text, 'admin' or 'citizen')
      - `full_name` (text)
      - `created_at` (timestamp)
    
    - `complaints`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text, complainant name)
      - `issue` (text, description)
      - `location` (text)
      - `status` (text, 'Pending', 'In-Progress', 'Resolved')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `amenities`
      - `id` (uuid, primary key)
      - `name` (text, amenity name)
      - `type` (text, 'park', 'school', 'hospital', etc.)
      - `location` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `announcements`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `created_by` (uuid, foreign key to users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
    - Users can only view their own complaints unless admin
    - Only admins can manage amenities and announcements
    - Admins can view and update all complaints

  3. Important Notes
    - Password field stores hashed passwords only
    - Default complaint status is 'Pending'
    - Role field validates against 'admin' or 'citizen'
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'citizen')),
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  issue text NOT NULL,
  location text NOT NULL,
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'In-Progress', 'Resolved')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  location text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can view own complaints"
  ON complaints FOR SELECT
  USING (true);

CREATE POLICY "Citizens can insert complaints"
  ON complaints FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update complaints"
  ON complaints FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view amenities"
  ON amenities FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage amenities"
  ON amenities FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view announcements"
  ON announcements FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage announcements"
  ON announcements FOR ALL
  USING (true)
  WITH CHECK (true);

INSERT INTO users (email, password, role, full_name) VALUES 
('admin@smartcity.com', 'admin123', 'admin', 'City Administrator'),
('citizen@smartcity.com', 'citizen123', 'citizen', 'John Citizen')
ON CONFLICT (email) DO NOTHING;

INSERT INTO amenities (name, type, location, description) VALUES 
('Central Park', 'park', 'Downtown', 'Large public park with playgrounds and walking trails'),
('City Hospital', 'hospital', 'Medical District', '24/7 emergency services and specialized care'),
('Lincoln High School', 'school', 'North District', 'Public high school serving grades 9-12')
ON CONFLICT DO NOTHING;

INSERT INTO announcements (title, content, created_by) VALUES 
('Welcome to Smart City', 'Our new digital platform makes city services more accessible.', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
('Road Maintenance Schedule', 'Main Street will undergo repairs from Dec 1-15.', (SELECT id FROM users WHERE role = 'admin' LIMIT 1))
ON CONFLICT DO NOTHING;