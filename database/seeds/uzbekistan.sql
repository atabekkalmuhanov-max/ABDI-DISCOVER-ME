-- Uzbekistan Destinations Seed Data
-- Run after schema.sql: psql -U postgres -d discover_me -f database/seeds/uzbekistan.sql

INSERT INTO destinations (name, country, description, image_url, category, best_season, price_level, featured, lat, lng, region) VALUES

-- SAMARKAND
('Registan Square', 'Uzbekistan',
 'The Registan is the soul of the ancient city of Samarkand, Central Asia''s greatest architectural ensemble. Comprising three magnificent madrasahs — Ulugh Beg, Tilya-Kori, and Sher-Dor — their turquoise domes and intricately tiled facades dazzle visitors. Once the vibrant commercial and spiritual heart of the Timurid empire, the Registan was declared a UNESCO World Heritage Site. At night, the illuminated mosaics create a magical atmosphere that transports visitors back to the golden age of the Silk Road.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Registan_Samarkand.jpg/800px-Registan_Samarkand.jpg',
 'Historical', 'Spring (April–May) & Autumn (September–October)', 2, TRUE, 39.6547, 66.9758, 'Samarkand'),

('Shah-i-Zinda Necropolis', 'Uzbekistan',
 'Shah-i-Zinda — meaning "the Living King" — is one of the most sacred sites in Central Asia and a dazzling collection of mausoleums spanning from the 11th to 19th centuries. The memorial complex contains the tomb of Kusam ibn Abbas, a cousin of the Prophet Muhammad, making it a major pilgrimage destination. The tombs are decorated with some of the finest tilework in the Islamic world, featuring intricate geometric patterns and calligraphy in vivid turquoise, cobalt blue, and gold.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Shah-i-Zinda_Samarkand.jpg/800px-Shah-i-Zinda_Samarkand.jpg',
 'Historical', 'Spring (April–May) & Autumn (September–October)', 1, TRUE, 39.6680, 66.9792, 'Samarkand'),

('Bibi-Khanym Mosque', 'Uzbekistan',
 'Built by Tamerlane in the early 15th century after his conquest of India, the Bibi-Khanym Mosque was once one of the largest mosques in the Islamic world. Named after Tamerlane''s favourite wife, it stands as a testament to the grandeur of the Timurid empire. Though earthquakes have damaged the structure over centuries, ongoing restoration work is bringing this architectural marvel back to its former glory. The mosque''s massive portal arch and azure dome remain awe-inspiring.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Bibi-Khanym_Mosque_%28Samarkand%2C_Uzbekistan%29.jpg/800px-Bibi-Khanym_Mosque_%28Samarkand%2C_Uzbekistan%29.jpg',
 'Historical', 'Spring & Autumn', 1, FALSE, 39.6618, 66.9735, 'Samarkand'),

('Ulugh Beg Observatory', 'Uzbekistan',
 'Built in 1428-1429 by the astronomer-king Ulugh Beg, this observatory was one of the finest in the Islamic world. The giant sextant carved into the hillside — once 40 metres tall — was used to create star catalogues of remarkable accuracy. The accompanying museum displays astronomical instruments and explains how Ulugh Beg''s observations were centuries ahead of European science. A fascinating testament to the intellectual brilliance of the Timurid Renaissance.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Ulugh_Beg_Observatory_Samarkand.jpg/800px-Ulugh_Beg_Observatory_Samarkand.jpg',
 'Historical', 'All year', 1, FALSE, 39.6740, 66.9551, 'Samarkand'),

-- BUKHARA
('Bukhara Old City', 'Uzbekistan',
 'Bukhara is one of the best-preserved examples of a medieval Central Asian city in the world. The historic centre, a UNESCO World Heritage Site, contains over 140 protected architectural monuments from every era of the city''s illustrious history. Stroll through the ancient trading domes, visit the Ark fortress, and marvel at the Kalon Minaret. Bukhara was a major centre of Islamic learning and culture for over a millennium, earning it the title "Bukhara the Noble".',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Bukhara-Citadel_ARK.jpg/800px-Bukhara-Citadel_ARK.jpg',
 'Historical', 'Spring (March–May) & Autumn', 2, TRUE, 39.7748, 64.4170, 'Bukhara'),

('Kalon Minaret', 'Uzbekistan',
 'Standing 48 metres tall, the Kalon (Great) Minaret has dominated the Bukhara skyline for over 900 years. Built in 1127 by the Karakhanid ruler Arslan Khan, it is one of the few structures in Central Asia that Genghis Khan ordered to be spared during his devastating conquest. Legend says the great conqueror was so awed by its beauty that he bowed in reverence — causing his hat to fall, forcing him to kneel. The minaret is decorated with 14 ornamental bands of intricate brickwork, each different from the others.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Kalon_Minaret_%28Bukhara%29.jpg/800px-Kalon_Minaret_%28Bukhara%29.jpg',
 'Historical', 'Spring & Autumn', 1, FALSE, 39.7761, 64.4166, 'Bukhara'),

('Lyab-i Hauz', 'Uzbekistan',
 'Lyab-i Hauz, meaning "around the pond", is the beautiful 17th-century ensemble centred on a reflecting pool that served as the main water source of medieval Bukhara. Surrounded by ancient mulberry trees and three architectural monuments — the Kukeldash Madrasa, the Nadir Divan-Begi Khanaka, and the Nadir Divan-Begi Madrasa — this square is the perfect place to relax in the evening. The famous statue of Nasreddin Hodja on his donkey adds a whimsical touch.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Lyabi_Hauz_Bukhara.jpg/800px-Lyabi_Hauz_Bukhara.jpg',
 'Cultural', 'Spring & Autumn', 1, FALSE, 39.7743, 64.4158, 'Bukhara'),

('Ismail Samani Mausoleum', 'Uzbekistan',
 'The Ismail Samani Mausoleum is perhaps the most perfect architectural monument in Central Asia. Built between 892 and 943 CE, it is one of the oldest surviving Muslim tombs in the world. The cubic structure with its magnificent dome showcases an extraordinary decorative brickwork technique where the patterns change appearance depending on the angle of sunlight throughout the day. The mausoleum survived the Mongol invasion because it was buried under sand and only rediscovered in the 20th century.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Ismoil_Somoniy_maqbarasi.jpg/800px-Ismoil_Somoniy_maqbarasi.jpg',
 'Historical', 'All year', 1, TRUE, 39.7774, 64.4105, 'Bukhara'),

-- KHIVA
('Khiva Old Town (Itchan Kala)', 'Uzbekistan',
 'Itchan Kala — the walled inner city of Khiva — is the most complete and well-preserved example of a medieval Central Asian city. Enclosed within massive mud-brick walls, the old town is a living museum of mosques, madrasahs, mausoleums, and caravanserais that have remained virtually unchanged for centuries. A UNESCO World Heritage Site, Khiva feels like stepping back into the ancient Silk Road era. The iconic unfinished Kalta Minor Minaret, once planned to be the world''s tallest, is perhaps the most photographed landmark.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Khiva_viewed_from_Islam_Khodja_minaret.jpg/800px-Khiva_viewed_from_Islam_Khodja_minaret.jpg',
 'Historical', 'Spring (April–June) & Autumn', 2, TRUE, 41.3775, 60.3636, 'Khwarezm'),

('Islam Khodja Minaret', 'Uzbekistan',
 'The tallest minaret in Khiva at 57 metres, the Islam Khodja Minaret was built in 1910 by the Grand Vizier Islam Khodja. Climbing its 118 steps rewards visitors with panoramic views over the mud-brick rooftops of Itchan Kala and the surrounding desert landscape. Adjacent to the minaret stands a beautifully restored madrasa that houses one of Khiva''s best museums of applied arts, displaying traditional Khorezmian textiles, jewellery, and ceramics.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Islam_Khodja_Minaret_Khiva.jpg/800px-Islam_Khodja_Minaret_Khiva.jpg',
 'Historical', 'Spring & Autumn', 1, FALSE, 41.3779, 60.3641, 'Khwarezm'),

-- TASHKENT
('Chorsu Bazaar', 'Uzbekistan',
 'Tashkent''s Chorsu Bazaar is one of the oldest and most vibrant markets in Central Asia. Named after the four streams that once flowed through it, the bazaar has been a trading hub for over 2,000 years. Today, the distinctive blue dome and colourful stalls overflow with fresh produce, spices, dried fruits, nuts, handwoven textiles, and local crafts. The bazaar is also a feast for food lovers, with vendors selling traditional Uzbek flatbreads (non), samosas, and grilled meats.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Chorsu_Bazaar_Tashkent.jpg/800px-Chorsu_Bazaar_Tashkent.jpg',
 'Cultural', 'All year', 1, FALSE, 41.3264, 69.2347, 'Tashkent'),

('Hazrat Imam Complex', 'Uzbekistan',
 'The Hazrat Imam Complex (Khast Imam) is the spiritual centre of Tashkent and one of the most important Islamic sites in Central Asia. The complex houses the world''s oldest Quran — the Uthman Quran, dating to the 7th century — as well as a stunning modern mosque capable of holding 5,000 worshippers. The adjacent library contains a remarkable collection of ancient Islamic manuscripts. The architectural ensemble blends traditional Uzbek and Islamic styles with impressive results.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Hazrat_Imam_Complex_Tashkent.jpg/800px-Hazrat_Imam_Complex_Tashkent.jpg',
 'Historical', 'All year', 1, FALSE, 41.3294, 69.2340, 'Tashkent'),

('Amir Temur Square', 'Uzbekistan',
 'The heart of modern Tashkent, Amir Temur Square is a grand public space dominated by the equestrian statue of Tamerlane and surrounded by some of the city''s most important buildings including the Hotel Uzbekistan, the History Museum, and the beautiful Alisher Navoi Opera and Ballet Theatre. The square is beautifully landscaped and comes alive in the evening when families gather and the fountains are illuminated. It perfectly captures the blend of Soviet-era grandeur and Uzbek national pride.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Amir_Temur_Square_Tashkent.jpg/800px-Amir_Temur_Square_Tashkent.jpg',
 'City', 'All year', 1, FALSE, 41.2988, 69.2794, 'Tashkent'),

-- SHAHRISABZ
('Shahrisabz Historic Centre', 'Uzbekistan',
 'Shahrisabz — the "Green City" — is the birthplace of the great conqueror Timur (Tamerlane) and contains some of the most impressive Timurid-era ruins in the world. The centrepiece is the Ak-Saray Palace (White Palace), of which only two massive portal towers survive, hinting at the extraordinary scale of what was once one of the grandest royal palaces ever built. Tamerlane''s mausoleum, the Gur-e-Amir of Samarkand''s older cousin, and the beautiful Kok Gumbaz Mosque complete this UNESCO-listed historic centre.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Ak-Saray_Palace_Shahrisabz.jpg/800px-Ak-Saray_Palace_Shahrisabz.jpg',
 'Historical', 'Spring & Autumn', 2, TRUE, 39.0558, 66.8342, 'Kashkadarya'),

-- FERGANA VALLEY
('Fergana Valley', 'Uzbekistan',
 'The Fergana Valley is the agricultural heartland of Uzbekistan and one of the most densely populated regions in Central Asia. Surrounded by majestic mountain ranges, the fertile valley has been famous for millennia for its Fergana horses (prized by Chinese emperors), its silk production, and its skilled craftsmen. Today visitors come to see silk weaving at Margilan''s Yodgorlik Silk Factory, to explore the bazaars of Kokand and Andijan, and to discover the distinctive pottery traditions of Rishtan.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Fergana_Valley_Uzbekistan.jpg/800px-Fergana_Valley_Uzbekistan.jpg',
 'Cultural', 'Spring & Summer', 2, FALSE, 40.3864, 71.7864, 'Fergana'),

('Margilan Silk Market', 'Uzbekistan',
 'Margilan has been the silk capital of the Silk Road for over 2,500 years. The Yodgorlik Silk Factory is one of the few places in the world where you can witness the entire silk production process — from boiling silkworm cocoons to the weaving of the famously vibrant adras and atlas fabrics on hand-operated looms. The factory''s showroom offers some of the finest and most authentic Uzbek silk products in the country. The Sunday bazaar is one of the most authentic markets in the Fergana Valley.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Yodgorlik_Silk_Factory_Margilan.jpg/800px-Yodgorlik_Silk_Factory_Margilan.jpg',
 'Cultural', 'All year (factory open weekdays)', 1, FALSE, 40.4721, 71.7201, 'Fergana'),

-- NATURE
('Chimgan Mountains', 'Uzbekistan',
 'Rising to 3,309 metres above sea level, the Chimgan Mountains offer Uzbekistan''s most accessible alpine scenery just 80 km northeast of Tashkent. The area is a favourite weekend retreat for Tashkent residents and offers excellent hiking in summer and skiing in winter. The chairlift to the Chimgan peak provides breathtaking views over the Charvak Reservoir — a stunning turquoise lake formed by a dam on the Chirchiq River. The surrounding hills are blanketed with wildflowers in spring and turn golden in autumn.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Chimgan_Mountains_Uzbekistan.jpg/800px-Chimgan_Mountains_Uzbekistan.jpg',
 'Mountain', 'Summer (hiking) & Winter (skiing)', 2, TRUE, 41.5667, 70.0333, 'Tashkent Region'),

('Charvak Reservoir', 'Uzbekistan',
 'The Charvak Reservoir is a stunning artificial lake in the foothills of the Western Tian Shan mountains, created in the 1970s by damming the Chirchiq River. The brilliant turquoise waters surrounded by dramatic mountain peaks make it one of the most photogenic spots in Uzbekistan. In summer it becomes a beach resort for Tashkent residents, with water sports, beach clubs, and restaurants along its shores. The drive through the Chirchiq Valley to reach the lake is itself a scenic highlight.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Charvak_Reservoir_Uzbekistan.jpg/800px-Charvak_Reservoir_Uzbekistan.jpg',
 'Nature', 'Summer (June–September)', 2, FALSE, 41.5519, 70.0497, 'Tashkent Region'),

('Aydarkul Lake', 'Uzbekistan',
 'Aydarkul is a vast artificial lake in the heart of the Kyzylkum Desert — one of the most surreal landscapes in Central Asia. The lake emerged in the 1960s when excess water from the Syr Darya River flooded a dry depression. Today it covers over 3,000 km² and has created its own unique ecosystem supporting flamingos, pelicans, and other migratory birds. Yurt camps along the shores offer visitors the unique experience of sleeping under an extraordinary canopy of stars in the desert, with fresh fish caught from the lake.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Aydarkul_Lake_Uzbekistan.jpg/800px-Aydarkul_Lake_Uzbekistan.jpg',
 'Nature', 'Spring & Autumn', 2, TRUE, 40.7500, 65.5000, 'Navoi Region'),

('Kyzylkum Desert', 'Uzbekistan',
 'The Kyzylkum — "Red Sand" — Desert is one of the largest deserts in Central Asia, covering parts of Uzbekistan, Kazakhstan, and Turkmenistan. It is not a vast sea of dunes but rather a varied landscape of saxaul forests, plateaus, and arid hills that has been traversed by Silk Road caravans for millennia. Traditional yurt camps offer visitors the chance to experience nomadic life, ride camels at sunset, and marvel at the extraordinary silence and star-filled skies of the desert night.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Kyzylkum_Desert_Uzbekistan.jpg/800px-Kyzylkum_Desert_Uzbekistan.jpg',
 'Desert', 'Spring (March–May) & Autumn', 2, FALSE, 41.5, 62.5, 'Navoi Region'),

('Nuratau Mountains', 'Uzbekistan',
 'The Nuratau Mountains form a natural barrier between the fertile farmland and the Kyzylkum Desert, and are home to a unique Community Based Tourism (CBT) programme. Visitors stay in traditional homes in ancient villages where centuries-old customs are still alive — from carpet weaving and pottery to traditional dances and cuisine. The mountains are an important bird migration corridor and home to the endangered Nurata wild sheep. Trek between villages and discover petroglyphs, ancient fortresses, and the famous Alexander the Great-era Nur Fortress.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/n/nu/Nuratau_Mountains_Uzbekistan.jpg/800px-Nuratau_Mountains_Uzbekistan.jpg',
 'Nature', 'Spring & Autumn', 1, FALSE, 40.5569, 65.6929, 'Navoi Region'),

('Ugam-Chatkal National Park', 'Uzbekistan',
 'Ugam-Chatkal National Park protects some of the most spectacular mountain scenery in Central Asia, featuring part of the Western Tian Shan range. The park''s rugged peaks, deep gorges, and rushing rivers are home to rare species including snow leopards, Marco Polo sheep, and the Menzbier''s marmot. The ancient walnut forests are among the largest natural walnut groves in the world. Hiking and trekking opportunities range from gentle valley walks to multi-day wilderness expeditions.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/u/ug/Ugam_Chatkal_Uzbekistan.jpg/800px-Ugam_Chatkal_Uzbekistan.jpg',
 'Adventure', 'Summer (June–September)', 2, FALSE, 41.5, 70.2, 'Tashkent Region'),

-- HISTORICAL
('Termez Ancient City', 'Uzbekistan',
 'Termez is one of the oldest continuously inhabited cities in Central Asia, with a history stretching back over 2,500 years. Situated on the banks of the Amu Darya River on the border with Afghanistan, Termez was a thriving Buddhist centre before the arrival of Islam, and the surrounding archaeological sites contain some of the most important Buddhist monuments in the world outside India. The Fayaz Tepe monastery, Sultan Saodat necropolis, and the Kokildor Mosque are among the highlights.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/t/te/Termez_Archaeological_Museum_Uzbekistan.jpg/800px-Termez_Archaeological_Museum_Uzbekistan.jpg',
 'Historical', 'Autumn & Winter (milder climate)', 2, FALSE, 37.2246, 67.2783, 'Surkhondarya')

ON CONFLICT DO NOTHING;

-- Add some sample reviews after inserting destinations
-- (These will work once users are created)
