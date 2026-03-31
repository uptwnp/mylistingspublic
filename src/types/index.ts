export type Property = {
  public_id: string;
  property_id: string;
  city: string;
  area: string;
  type: string;
  description: string;
  size_min: number;
  size_max: number;
  size_unit: string;
  price_min: number;
  price_max: number;

  highlights: string[];
  image_urls: string[];
  is_photos_public: boolean;
  landmark_location: string;
  landmark_location_distance?: number;
  latitude?: number;
  longitude?: number;
  loc_fallback?: boolean;
  formatted_price?: string;
  search_text?: string;
  status: string;
  approved_on: string;
  created_on?: string;
  updated_on?: string;
};

export type ShortlistItem = {
  id: string;
  notes?: string;
  addedAt: number;
};

export type Visitor = {
  id?: string;
  dealer_id?: string;
  name: string;
  phone: string;
  email?: string;
  budget?: string;
  address?: string;
  active_request_type?: 'call' | 'visit' | 'sell' | 'other';
  pref_ts?: string;
  ip?: string;
  domain?: string;
  ref?: string;
  shortlist_items_json?: ShortlistItem[];
  created_at?: string;
  updated_at?: string;
};

export type ForSellRequest = {
  id?: string;
  visitor_id?: string;
  dealer_id?: string;
  property_type: string;
  city: string;
  area: string;
  price: number;
  size: number;
  size_unit: string;
  description?: string;
  address?: string;
  landmark_location?: string;
  landmark_location_distance?: number;
  images_json?: string[];
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
};
