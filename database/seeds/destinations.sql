-- Seed: Sample destinations for development
-- Run: psql -U postgres -d discover_me -f database/seeds/destinations.sql

INSERT INTO destinations (name, country, description, image_url, category, best_season, price_level, featured) VALUES
  ('Santorini', 'Greece', 'Iconic white-washed buildings perched on volcanic cliffs above the Aegean Sea, famous for spectacular sunsets and crystal-clear waters.', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', 'Island', 'Spring/Fall', 3, TRUE),
  ('Machu Picchu', 'Peru', 'Ancient Incan citadel set high in the Andes Mountains, a UNESCO World Heritage Site and one of South America''s most iconic landmarks.', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800', 'Cultural', 'May–Oct', 2, TRUE),
  ('Bali', 'Indonesia', 'Tropical paradise known for lush rice terraces, sacred temples, and a vibrant spiritual culture. Perfect for adventure and relaxation.', 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800', 'Beach', 'Apr–Oct', 1, TRUE),
  ('Kyoto', 'Japan', 'Japan''s cultural heart with over 1,600 Buddhist temples, traditional tea houses, and stunning cherry blossom scenery.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 'Cultural', 'Mar–May', 2, TRUE),
  ('Patagonia', 'Argentina/Chile', 'Dramatic landscapes of glaciers, mountains, and untouched wilderness at the southern tip of South America.', 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800', 'Adventure', 'Nov–Feb', 3, FALSE),
  ('Marrakech', 'Morocco', 'Vibrant medina filled with souks, palaces, and riads. A sensory feast of colours, aromas, and centuries-old architecture.', 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800', 'Cultural', 'Mar–May', 1, TRUE),
  ('Maldives', 'Maldives', 'Pristine overwater bungalows above turquoise lagoons and coral reefs — the ultimate luxury beach getaway.', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800', 'Beach', 'Nov–Apr', 4, TRUE),
  ('Banff National Park', 'Canada', 'Turquoise lakes, snow-capped peaks, and abundant wildlife in the heart of the Canadian Rockies.', 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800', 'Nature', 'Jun–Sep', 2, FALSE),
  ('Amalfi Coast', 'Italy', 'Dramatic cliffside towns, pastel-coloured villas, and breathtaking sea views along southern Italy''s UNESCO-listed coastline.', 'https://images.unsplash.com/photo-1533606688076-b6f19f2bad06?w=800', 'Beach', 'May–Sep', 3, FALSE),
  ('Serengeti', 'Tanzania', 'Witness the world''s greatest wildlife migration across vast golden plains teeming with lions, elephants, and wildebeest.', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800', 'Adventure', 'Jun–Oct', 3, FALSE)
ON CONFLICT DO NOTHING;
