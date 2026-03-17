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
  tags: string[];
  highlights: string[];
  image_urls: string[];
  is_photos_public: boolean;
  landmark_location: string;
  landmark_location_distance: number;
  latitude?: number;
  longitude?: number;
  status: string;
  approved_on: string;
};

export type DiscussionCartItem = {
  id: string;
  addedAt: number;
};
