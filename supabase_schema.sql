-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'member');

-- 2. LOCATION TABLES (Normalized)
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL
);

CREATE TABLE assemblies (
    id SERIAL PRIMARY KEY,
    district_id INT REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    assembly_number INT NOT NULL,
    UNIQUE(district_id, name)
);

CREATE TABLE taluks (
    id SERIAL PRIMARY KEY,
    district_id INT REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE(district_id, name)
);

CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    taluk_id INT REFERENCES taluks(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE(taluk_id, name)
);

CREATE TABLE revenue_villages (
    id SERIAL PRIMARY KEY,
    block_id INT REFERENCES blocks(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50),
    UNIQUE(block_id, name)
);

-- 3. MEMBERSHIP ID SEQUENCE TABLE
CREATE TABLE membership_sequences (
    district_code VARCHAR(10),
    assembly_number INT,
    last_serial INT DEFAULT 0,
    PRIMARY KEY (district_code, assembly_number)
);

-- 4. USERS & ROLES
CREATE TABLE user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'member',
    granted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MEMBERS TABLE
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    membership_id VARCHAR(50) UNIQUE NOT NULL,
    serial_number INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    district_id INT REFERENCES districts(id),
    assembly_id INT REFERENCES assemblies(id),
    taluk_id INT REFERENCES taluks(id),
    block_id INT REFERENCES blocks(id),
    village_id INT REFERENCES revenue_villages(id),
    current_location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SECURE MEMBERSHIP ID GENERATOR (Backend Function)
CREATE OR REPLACE FUNCTION generate_membership_id(p_dist_code VARCHAR, p_assembly_num INT)
RETURNS TABLE(membership_id VARCHAR, serial_number INT) AS $$
DECLARE
    v_next_serial INT;
    v_id VARCHAR;
BEGIN
    INSERT INTO membership_sequences (district_code, assembly_number, last_serial)
    VALUES (p_dist_code, p_assembly_num, 1)
    ON CONFLICT (district_code, assembly_number)
    DO UPDATE SET last_serial = membership_sequences.last_serial + 1
    RETURNING last_serial INTO v_next_serial;

    v_id := 'TN-' || p_dist_code || '-' || p_assembly_num || '-' || LPAD(v_next_serial::text, 4, '0');
    
    RETURN QUERY SELECT v_id, v_next_serial;
END;
$$ LANGUAGE plpgsql;

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view own data" ON members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all members" ON members FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));
