-- Optimized Property Discovery Function (V3)
-- This function handles filtering, pagination, and distance-based sorting in a single RPC call.
-- Now supports Bounding Box for Map-based fetching.

-- Remove the existing function first to avoid conflict with the return type.
DROP FUNCTION IF EXISTS get_public_properties_v2(text,text,text,numeric,numeric,numeric,numeric,text,text,numeric,numeric,text,text,integer,integer);
DROP FUNCTION IF EXISTS get_public_properties_v2(text,text,text,numeric,numeric,numeric,numeric,text,text,numeric,numeric,text,text,integer,integer,numeric,numeric,numeric,numeric);

CREATE OR REPLACE FUNCTION get_public_properties_v2(
  p_city TEXT DEFAULT 'All',
  p_type TEXT DEFAULT 'All',
  p_area TEXT DEFAULT 'All',
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_min_size NUMERIC DEFAULT NULL,
  p_max_size NUMERIC DEFAULT NULL,
  p_highlights TEXT DEFAULT NULL,
  p_keywords TEXT DEFAULT NULL,
  p_user_lat NUMERIC DEFAULT NULL,
  p_user_lng NUMERIC DEFAULT NULL,
  p_sort_field TEXT DEFAULT 'approved_on',
  p_sort_order TEXT DEFAULT 'desc',
  p_page INT DEFAULT 0,
  p_limit INT DEFAULT 20,
  p_min_lat NUMERIC DEFAULT NULL,
  p_max_lat NUMERIC DEFAULT NULL,
  p_min_lng NUMERIC DEFAULT NULL,
  p_max_lng NUMERIC DEFAULT NULL
)
RETURNS TABLE (
  properties JSONB,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_count BIGINT;
  v_properties JSONB;
BEGIN
  -- 1. Get filtered total count
  SELECT COUNT(*)
  INTO v_total_count
  FROM website_public_listing
  WHERE
    (p_city = 'All' OR city ILIKE '%' || p_city || '%') AND
    (p_type = 'All' OR type ILIKE '%' || p_type || '%') AND
    (p_area = 'All' OR p_area = 'Near Me' OR area ILIKE '%' || p_area || '%') AND
    (p_min_price IS NULL OR price_max >= p_min_price) AND
    (p_max_price IS NULL OR price_min <= p_max_price) AND
    (p_min_size IS NULL OR size_max >= p_min_size) AND
    (p_max_size IS NULL OR size_min <= p_max_size) AND
    (p_highlights IS NULL OR tags::text ILIKE '%' || p_highlights || '%' OR highlights::text ILIKE '%' || p_highlights || '%') AND
    (p_keywords IS NULL OR search_text ILIKE '%' || p_keywords || '%' OR description ILIKE '%' || p_keywords || '%') AND
    (p_min_lat IS NULL OR latitude >= p_min_lat) AND
    (p_max_lat IS NULL OR latitude <= p_max_lat) AND
    (p_min_lng IS NULL OR longitude >= p_min_lng) AND
    (p_max_lng IS NULL OR longitude <= p_max_lng);

  -- 2. Get the paginated results as JSONB
  SELECT COALESCE(jsonb_agg(t), '[]'::jsonb)
  INTO v_properties
  FROM (
    SELECT *
    FROM website_public_listing
    WHERE
      (p_city = 'All' OR city ILIKE '%' || p_city || '%') AND
      (p_type = 'All' OR type ILIKE '%' || p_type || '%') AND
      (p_area = 'All' OR p_area = 'Near Me' OR area ILIKE '%' || p_area || '%') AND
      (p_min_price IS NULL OR price_max >= p_min_price) AND
      (p_max_price IS NULL OR price_min <= p_max_price) AND
      (p_min_size IS NULL OR size_max >= p_min_size) AND
      (p_max_size IS NULL OR size_min <= p_max_size) AND
      (p_highlights IS NULL OR tags::text ILIKE '%' || p_highlights || '%' OR highlights::text ILIKE '%' || p_highlights || '%') AND
      (p_keywords IS NULL OR search_text ILIKE '%' || p_keywords || '%' OR description ILIKE '%' || p_keywords || '%') AND
      (p_min_lat IS NULL OR latitude >= p_min_lat) AND
      (p_max_lat IS NULL OR latitude <= p_max_lat) AND
      (p_min_lng IS NULL OR longitude >= p_min_lng) AND
      (p_max_lng IS NULL OR longitude <= p_max_lng)
    ORDER BY
      CASE WHEN p_sort_field = 'distance' AND p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL THEN (point(longitude, latitude) <-> point(p_user_lng, p_user_lat)) END ASC NULLS LAST,
      CASE WHEN p_sort_field = 'price_min' AND p_sort_order = 'asc' THEN price_min END ASC NULLS LAST,
      CASE WHEN p_sort_field = 'price_min' AND p_sort_order = 'desc' THEN price_min END DESC NULLS LAST,
      CASE WHEN p_sort_field = 'size_min' AND p_sort_order = 'asc' THEN size_min END ASC NULLS LAST,
      CASE WHEN p_sort_field = 'size_min' AND p_sort_order = 'desc' THEN size_min END DESC NULLS LAST,
      CASE WHEN p_sort_field = 'approved_on' AND p_sort_order = 'asc' THEN approved_on END ASC NULLS LAST,
      CASE WHEN p_sort_field = 'approved_on' AND p_sort_order = 'desc' THEN approved_on END DESC NULLS LAST,
      -- Fallback sort for consistency
      approved_on DESC, property_id DESC
    LIMIT p_limit
    OFFSET (p_page * p_limit)
  ) t;

  RETURN QUERY SELECT v_properties, v_total_count;
END;
$$;

