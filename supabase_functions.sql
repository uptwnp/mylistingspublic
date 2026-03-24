-- Optimized Property Discovery Function
-- Synced to live DB signature. Key changes vs previous version:
--   - DOUBLE PRECISION for all lat/lng params (matches live DB)
--   - Explicit column SELECT (not SELECT *) to match live DB
--   - 'Any Type', 'any-type', etc. treated as wildcards for p_type
--   - 'anywhere', 'Anywhere', etc. treated as wildcards for p_area

-- Drop any older overloaded variants before recreating
DROP FUNCTION IF EXISTS get_public_properties_v2(text,text,text,numeric,numeric,numeric,numeric,text,text,numeric,numeric,text,text,integer,integer);
DROP FUNCTION IF EXISTS get_public_properties_v2(text,text,text,numeric,numeric,numeric,numeric,text,text,numeric,numeric,text,text,integer,integer,numeric,numeric,numeric,numeric);
DROP FUNCTION IF EXISTS get_public_properties_v2(text,text,text,numeric,numeric,numeric,numeric,text,text,double precision,double precision,text,text,integer,integer,double precision,double precision,double precision,double precision);

CREATE OR REPLACE FUNCTION get_public_properties_v2(
  p_city            TEXT,
  p_type            TEXT,
  p_area            TEXT,
  p_min_price       NUMERIC,
  p_max_price       NUMERIC,
  p_min_size        NUMERIC,
  p_max_size        NUMERIC,
  p_highlights      TEXT,
  p_keywords        TEXT,
  p_user_lat        DOUBLE PRECISION,
  p_user_lng        DOUBLE PRECISION,
  p_sort_field      TEXT,
  p_sort_order      TEXT,
  p_page            INTEGER,
  p_limit           INTEGER,
  p_min_lat         DOUBLE PRECISION DEFAULT NULL,
  p_max_lat         DOUBLE PRECISION DEFAULT NULL,
  p_min_lng         DOUBLE PRECISION DEFAULT NULL,
  p_max_lng         DOUBLE PRECISION DEFAULT NULL
)
RETURNS TABLE (properties JSONB, total_count BIGINT)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_count BIGINT;
  v_properties  JSONB;
BEGIN
  -- 1. Filtered total count
  SELECT COUNT(*) INTO v_total_count
  FROM website_public_listing
  WHERE
    (p_city = 'All' OR city ILIKE '%' || p_city || '%') AND
    -- 'Any Type', 'any-type', etc. are treated as "no type filter"
    (p_type IN ('All', 'Any Type', 'any-type', 'anything', 'any') OR type ILIKE '%' || p_type || '%') AND
    -- 'anywhere', 'Near Me', etc. are treated as "no area filter"
    (p_area IN ('All', 'anywhere', 'Anywhere', 'Near Me', 'any') OR area ILIKE '%' || p_area || '%') AND
    (p_min_price IS NULL OR price_max >= p_min_price) AND
    (p_max_price IS NULL OR price_min <= p_max_price) AND
    (p_min_size IS NULL OR size_max >= p_min_size) AND
    (p_max_size IS NULL OR size_min <= p_max_size) AND
    (p_highlights IS NULL OR highlights::text ILIKE '%' || p_highlights || '%') AND
    (p_keywords IS NULL OR search_text ILIKE '%' || p_keywords || '%' OR description ILIKE '%' || p_keywords || '%') AND
    (p_min_lat IS NULL OR latitude >= p_min_lat) AND
    (p_max_lat IS NULL OR latitude <= p_max_lat) AND
    (p_min_lng IS NULL OR longitude >= p_min_lng) AND
    (p_max_lng IS NULL OR longitude <= p_max_lng);

  -- 2. Paginated results (explicit column list mirrors live DB)
  SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) INTO v_properties
  FROM (
    SELECT
      public_id, property_id, city, area, type, description,
      size_min, size_max, size_unit, price_min, price_max,
      formatted_price, highlights, image_urls, is_photos_public,
      landmark_location, latitude, longitude, loc_fallback,
      landmark_location_distance, search_text, approved_on, status
    FROM website_public_listing
    WHERE
      (p_city = 'All' OR city ILIKE '%' || p_city || '%') AND
      (p_type IN ('All', 'Any Type', 'any-type', 'anything', 'any') OR type ILIKE '%' || p_type || '%') AND
      (p_area IN ('All', 'anywhere', 'Anywhere', 'Near Me', 'any') OR area ILIKE '%' || p_area || '%') AND
      (p_min_price IS NULL OR price_max >= p_min_price) AND
      (p_max_price IS NULL OR price_min <= p_max_price) AND
      (p_min_size IS NULL OR size_max >= p_min_size) AND
      (p_max_size IS NULL OR size_min <= p_max_size) AND
      (p_highlights IS NULL OR highlights::text ILIKE '%' || p_highlights || '%') AND
      (p_keywords IS NULL OR search_text ILIKE '%' || p_keywords || '%' OR description ILIKE '%' || p_keywords || '%') AND
      (p_min_lat IS NULL OR latitude >= p_min_lat) AND
      (p_max_lat IS NULL OR latitude <= p_max_lat) AND
      (p_min_lng IS NULL OR longitude >= p_min_lng) AND
      (p_max_lng IS NULL OR longitude <= p_max_lng)
    ORDER BY
      CASE WHEN p_sort_field = 'distance' AND p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL
        THEN (point(longitude, latitude) <-> point(p_user_lng, p_user_lat)) END ASC NULLS LAST,
      CASE WHEN p_sort_field = 'price_min' AND p_sort_order = 'asc'  THEN price_min END ASC  NULLS LAST,
      CASE WHEN p_sort_field = 'price_min' AND p_sort_order = 'desc' THEN price_min END DESC NULLS LAST,
      CASE WHEN p_sort_field = 'size_min'  AND p_sort_order = 'asc'  THEN size_min  END ASC  NULLS LAST,
      CASE WHEN p_sort_field = 'size_min'  AND p_sort_order = 'desc' THEN size_min  END DESC NULLS LAST,
      CASE WHEN p_sort_field = 'approved_on' AND p_sort_order = 'asc'  THEN approved_on END ASC  NULLS LAST,
      CASE WHEN p_sort_field = 'approved_on' AND p_sort_order = 'desc' THEN approved_on END DESC NULLS LAST,
      approved_on DESC, property_id DESC
    LIMIT p_limit
    OFFSET (p_page * p_limit)
  ) t;

  RETURN QUERY SELECT v_properties, v_total_count;
END;
$$;


