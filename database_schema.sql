-- Visitors Table
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_id UUID,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    budget TEXT,
    address TEXT,
    active_request_type TEXT, -- e.g., 'call', 'visit', 'sell'
    pref_ts TIMESTAMPTZ, -- preferred timestamp for consultation
    ip TEXT,
    domain TEXT,
    ref TEXT, -- referral source
    shortlist_items_json JSONB DEFAULT '[]'::jsonb, -- Array of {property_id, notes, added_at}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- For Sell Requests Table
CREATE TABLE IF NOT EXISTS for_sell_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
    dealer_id UUID,
    property_type TEXT,
    city TEXT,
    area TEXT,
    price NUMERIC, -- in Lakhs or Cr (consistent with Property table)
    size NUMERIC,
    size_unit TEXT DEFAULT 'Sq.Yds',
    description TEXT,
    address TEXT,
    landmark_location TEXT, -- lat,lng or description
    landmark_location_distance NUMERIC,
    images_json JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_visitors_phone ON visitors(phone);
CREATE INDEX IF NOT EXISTS idx_for_sell_requests_visitor_id ON for_sell_requests(visitor_id);

-- Enable Row Level Security (RLS)
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE for_sell_requests ENABLE ROW LEVEL SECURITY;

-- Public Access Policies (Allow inserts from anonymous users)
CREATE POLICY "Allow public insert to visitors" ON visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to for_sell_requests" ON for_sell_requests FOR INSERT WITH CHECK (true);

-- Functions for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_visitors_updated_at
    BEFORE UPDATE ON visitors
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_for_sell_requests_updated_at
    BEFORE UPDATE ON for_sell_requests
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
