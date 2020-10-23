DROP TABLE IF EXISTS locations;
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  latitude NUMERIC,
  longitude NUMERIC,
  formatted_query VARCHAR(255)
);