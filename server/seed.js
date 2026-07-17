import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/user.model.js';
import Listing from './models/listing.model.js';
import { connectDB } from './config/db.js';

dotenv.config();

// ---------------------------------------------------------------------------
// Location data: country -> cities with real coordinates
// ---------------------------------------------------------------------------
const COUNTRIES = [
  {
    country: 'India',
    cities: [
      { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
      { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
      { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
      { city: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
      { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
      { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
      { city: 'Vizag', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
    ],
  },
  {
    country: 'Japan',
    cities: [
      { city: 'Tokyo', state: 'Tokyo', lat: 35.6762, lng: 139.6503 },
      { city: 'Osaka', state: 'Osaka', lat: 34.6937, lng: 135.5023 },
      { city: 'Kyoto', state: 'Kyoto', lat: 35.0116, lng: 135.7681 },
      { city: 'Yokohama', state: 'Kanagawa', lat: 35.4437, lng: 139.6380 },
      { city: 'Nagoya', state: 'Aichi', lat: 35.1815, lng: 136.9066 },
      { city: 'Sapporo', state: 'Hokkaido', lat: 43.0618, lng: 141.3545 },
      { city: 'Fukuoka', state: 'Fukuoka', lat: 33.5904, lng: 130.4017 },
    ],
  },
  {
    country: 'United States',
    cities: [
      { city: 'New York', state: 'New York', lat: 40.7128, lng: -74.0060 },
      { city: 'Los Angeles', state: 'California', lat: 34.0522, lng: -118.2437 },
      { city: 'Chicago', state: 'Illinois', lat: 41.8781, lng: -87.6298 },
      { city: 'Miami', state: 'Florida', lat: 25.7617, lng: -80.1918 },
      { city: 'Austin', state: 'Texas', lat: 30.2672, lng: -97.7431 },
      { city: 'Seattle', state: 'Washington', lat: 47.6062, lng: -122.3321 },
      { city: 'Boston', state: 'Massachusetts', lat: 42.3601, lng: -71.0589 },
    ],
  },
  {
    country: 'Canada',
    cities: [
      { city: 'Toronto', state: 'Ontario', lat: 43.6532, lng: -79.3832 },
      { city: 'Vancouver', state: 'British Columbia', lat: 49.2827, lng: -123.1207 },
      { city: 'Montreal', state: 'Quebec', lat: 45.5017, lng: -73.5673 },
    ],
  },
  {
    country: 'United Kingdom',
    cities: [
      { city: 'London', state: 'England', lat: 51.5074, lng: -0.1278 },
      { city: 'Manchester', state: 'Greater Manchester', lat: 53.4808, lng: -2.2426 },
      { city: 'Edinburgh', state: 'Scotland', lat: 55.9533, lng: -3.1883 },
      { city: 'Birmingham', state: 'England', lat: 52.4862, lng: -1.8904 },
    ],
  },
  {
    country: 'Australia',
    cities: [
      { city: 'Sydney', state: 'New South Wales', lat: -33.8688, lng: 151.2093 },
      { city: 'Melbourne', state: 'Victoria', lat: -37.8136, lng: 144.9631 },
      { city: 'Brisbane', state: 'Queensland', lat: -27.4698, lng: 153.0251 },
    ],
  },
  {
    country: 'Germany',
    cities: [
      { city: 'Berlin', state: 'Berlin', lat: 52.5200, lng: 13.4050 },
      { city: 'Munich', state: 'Bavaria', lat: 48.1351, lng: 11.5820 },
      { city: 'Hamburg', state: 'Hamburg', lat: 53.5511, lng: 9.9937 },
    ],
  },
  {
    country: 'France',
    cities: [
      { city: 'Paris', state: 'Île-de-France', lat: 48.8566, lng: 2.3522 },
      { city: 'Lyon', state: 'Auvergne-Rhône-Alpes', lat: 45.7640, lng: 4.8357 },
      { city: 'Marseille', state: 'Provence-Alpes-Côte d\'Azur', lat: 43.2965, lng: 5.3698 },
      { city: 'Nice', state: 'Provence-Alpes-Côte d\'Azur', lat: 43.7102, lng: 7.2620 },
    ],
  },
  {
    country: 'Singapore',
    cities: [
      { city: 'Marina Bay', state: 'Central Region', lat: 1.2830, lng: 103.8607 },
      { city: 'Orchard', state: 'Central Region', lat: 1.3048, lng: 103.8318 },
      { city: 'Sentosa', state: 'Central Region', lat: 1.2494, lng: 103.8303 },
    ],
  },
  {
    country: 'United Arab Emirates',
    cities: [
      { city: 'Dubai', state: 'Dubai', lat: 25.2048, lng: 55.2708 },
      { city: 'Abu Dhabi', state: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
      { city: 'Sharjah', state: 'Sharjah', lat: 25.3463, lng: 55.4209 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Property archetypes: mix of residential and commercial, spanning price tiers
// ---------------------------------------------------------------------------
const PROPERTY_TYPES = [
  { label: 'Luxury Villa', tier: 'luxury', beds: [4, 6], baths: [4, 6], listingType: 'sale', parkingBias: 0.95, furnishedBias: 0.8 },
  { label: 'Modern Apartment', tier: 'mid', beds: [2, 3], baths: [2, 2], listingType: 'both', parkingBias: 0.6, furnishedBias: 0.55 },
  { label: 'Skyline Condo', tier: 'luxury', beds: [2, 4], baths: [2, 3], listingType: 'sale', parkingBias: 0.9, furnishedBias: 0.75 },
  { label: 'Independent House', tier: 'mid', beds: [3, 5], baths: [2, 4], listingType: 'sale', parkingBias: 0.85, furnishedBias: 0.4 },
  { label: 'Countryside Farm House', tier: 'luxury', beds: [4, 6], baths: [3, 5], listingType: 'sale', parkingBias: 0.9, furnishedBias: 0.5 },
  { label: 'Commercial Building', tier: 'luxury', beds: [0, 0], baths: [2, 3], listingType: 'sale', parkingBias: 0.7, furnishedBias: 0 },
  { label: 'Office Space', tier: 'mid', beds: [0, 0], baths: [1, 2], listingType: 'rent', parkingBias: 0.8, furnishedBias: 0.3 },
  { label: 'Residential Plot', tier: 'affordable', beds: [0, 0], baths: [0, 0], listingType: 'sale', parkingBias: 0, furnishedBias: 0 },
  { label: 'Studio Apartment', tier: 'affordable', beds: [1, 1], baths: [1, 1], listingType: 'rent', parkingBias: 0.3, furnishedBias: 0.8 },
  { label: 'Penthouse', tier: 'luxury', beds: [3, 5], baths: [3, 5], listingType: 'sale', parkingBias: 0.95, furnishedBias: 0.9 },
  { label: 'Townhouse', tier: 'mid', beds: [3, 4], baths: [2, 3], listingType: 'sale', parkingBias: 0.8, furnishedBias: 0.45 },
];

const PRICE_RANGES = {
  affordable: { sale: [60000, 250000], rent: [400, 1200] },
  mid: { sale: [250000, 900000], rent: [1200, 3500] },
  luxury: { sale: [900000, 8000000], rent: [3500, 20000] },
};

const AMENITY_POOL = [
  'Swimming Pool', 'Private Garden', 'Smart Home System', 'Sea View', 'Gymnasium',
  'Rooftop Terrace', '24/7 Security', 'Home Theatre', 'Walk-in Closet',
  'Central Air Conditioning', 'Solar Panels', 'Guest House', 'Wine Cellar',
  'Elevator Access', 'Pet Friendly', 'Balcony', 'Fireplace', 'Concierge Service',
];
const LUXURY_AMENITY_POOL = ['Swimming Pool', 'Smart Home System', 'Sea View', 'Home Theatre', 'Wine Cellar', 'Concierge Service'];

// A pool of distinct real-estate-relevant Unsplash photo IDs. Each listing
// draws a unique combination of (photo id + crop variant) so no two
// properties ever render the exact same image URL.
const IMAGE_POOL = [
  '1564013799919-ab600027ffc6', '1600585154340-be6161a56a0c', '1600607687939-ce8a6c25118c',
  '1512917774080-9991f1c4c750', '1580587771525-78b9dba3b914', '1600596542815-ffad4c1539a9',
  '1600566753376-12c8ab7fb75b', '1582268611958-ebfd161ef9cf', '1513584684374-8bab748fbf90',
  '1512918728675-ed5a9ecdebfd', '1600210492486-724fe5c67fb0', '1502005229762-fc1b2b812ca5',
  '1522708323590-d24dbb6b0267', '1502672260266-1c1ef2d93688', '1560448204-e02f11c3d0e2',
  '1560185007-cde436f6a4d0', '1600607687920-4e2a09cf159d', '1542314831-068cd1dbfeeb',
  '1484154218962-a197022b5858', '1584622650111-993a426fbf0a',
  '1600585154526-990dced4db0d', '1600566753086-00f18fb6b3ea', '1570129477492-45c003edd2be',
  '1613977257363-707ba9348227', '1600607687644-c7171b42498b', '1554995207-c18c203602cb',
  '1600047509807-ba8f99d2cdde', '1524758631624-e2822e304c36', '1493809842364-78817add7ffb',
  '1591474200742-8e512e6f98f8', '1560184897-502a475f7a30', '1600210491892-03d54c0aaf87',
  '1568605114967-8130f3a36994', '1449844908441-8829872d2607', '1518780664697-55e3ad937233',
  '1616486338812-3dadae4b4ace',
];

const CROP_VARIANTS = ['entropy', 'faces', 'edges', 'focalpoint', 'top', 'bottom', 'left', 'right'];

// Ensure every image URL used is unique across the whole seed run: cycle the
// pool, and once fully cycled vary the crop/focus parameter and a cache-bust
// signature so the resulting URL string never repeats, even across ~500 calls.
let imagePoolIndex = 0;
const nextImage = () => {
  const cycle = Math.floor(imagePoolIndex / IMAGE_POOL.length);
  const id = IMAGE_POOL[imagePoolIndex % IMAGE_POOL.length];
  imagePoolIndex += 1;
  const cropParam = CROP_VARIANTS[cycle % CROP_VARIANTS.length];
  const cropSuffix = cycle > 0 ? `&crop=${cropParam}&sig=${cycle}` : '';
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80${cropSuffix}`;
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randomInt(0, arr.length - 1)];
const jitter = (value, spread) => value + (Math.random() - 0.5) * spread;

const pickAmenities = (tier, parking) => {
  const pool = tier === 'luxury' ? [...LUXURY_AMENITY_POOL, ...AMENITY_POOL] : AMENITY_POOL;
  const shuffled = [...new Set(pool)].sort(() => Math.random() - 0.5);
  const count = tier === 'luxury' ? randomInt(4, 6) : tier === 'mid' ? randomInt(3, 5) : randomInt(2, 3);
  const amenities = shuffled.slice(0, count);
  if (parking && !amenities.includes('Covered Parking')) amenities.push('Covered Parking');
  return amenities;
};

const NEIGHBORHOOD_WORDS = ['Central', 'Riverside', 'Hillside', 'Garden', 'Harbor', 'North', 'West', 'Old Town', 'Uptown', 'Lakeview'];

const buildListing = (countryEntry, cityEntry, propertyType) => {
  const { country } = countryEntry;
  const { city, state, lat, lng } = cityEntry;

  const listingType =
    propertyType.listingType === 'both' ? (Math.random() < 0.5 ? 'sale' : 'rent') : propertyType.listingType;

  const priceRange = PRICE_RANGES[propertyType.tier][listingType];
  const price = Math.round(randomInt(priceRange[0], priceRange[1]) / 100) * 100;

  const offer = Math.random() < 0.3;
  const discountPrice = offer ? Math.round((price * randomInt(85, 96)) / 100 / 100) * 100 : price;

  const bedrooms = randomInt(propertyType.beds[0], propertyType.beds[1]);
  const bathrooms = randomInt(propertyType.baths[0], propertyType.baths[1]);
  const parking = Math.random() < propertyType.parkingBias;
  const furnished = Math.random() < propertyType.furnishedBias;
  const amenities = pickAmenities(propertyType.tier, parking);

  const neighborhood = pick(NEIGHBORHOOD_WORDS);
  const title = `${neighborhood} ${propertyType.label} in ${city}`;
  const address = `${randomInt(1, 999)} ${neighborhood} Street, ${city}, ${state}`;

  const description = `A well-maintained ${propertyType.label.toLowerCase()} located in the ${neighborhood.toLowerCase()} area of ${city}, ${country}. ` +
    `This ${listingType === 'rent' ? 'rental' : 'property'} offers ${bedrooms > 0 ? `${bedrooms} bedroom${bedrooms > 1 ? 's' : ''} and ` : ''}` +
    `${bathrooms > 0 ? `${bathrooms} bathroom${bathrooms > 1 ? 's' : ''}, ` : ''}` +
    `with amenities including ${amenities.slice(0, 3).join(', ').toLowerCase()}, ` +
    `and convenient access to local schools, transit, and dining. ` +
    `Perfectly suited for ${propertyType.tier === 'luxury' ? 'discerning buyers seeking a premium lifestyle' : propertyType.tier === 'affordable' ? 'first-time buyers and renters' : 'families and professionals'}.`;

  const imageCount = propertyType.tier === 'luxury' ? 3 : 2;
  const imageUrls = Array.from({ length: imageCount }, () => nextImage());

  return {
    title,
    description,
    address,
    country,
    state,
    city,
    latitude: Number(jitter(lat, 0.08).toFixed(4)),
    longitude: Number(jitter(lng, 0.08).toFixed(4)),
    price,
    discountPrice,
    bedrooms,
    bathrooms,
    furnished,
    parking,
    type: listingType,
    offer,
    currencyBase: 'USD',
    imageUrls,
    amenities,
    tier: propertyType.tier,
  };
};

// Target ~17 listings per country -> ~170 total across 10 countries (within
// the requested 150-200 range), distributed evenly across each country's cities.
const TARGET_PER_COUNTRY = 17;

const generateListings = () => {
  const listings = [];
  let typeCursor = 0;

  COUNTRIES.forEach((countryEntry) => {
    const numCities = countryEntry.cities.length;
    const base = Math.floor(TARGET_PER_COUNTRY / numCities);
    const remainder = TARGET_PER_COUNTRY - base * numCities;

    countryEntry.cities.forEach((cityEntry, cityIdx) => {
      const count = base + (cityIdx < remainder ? 1 : 0);

      for (let i = 0; i < count; i += 1) {
        const propertyType = PROPERTY_TYPES[typeCursor % PROPERTY_TYPES.length];
        typeCursor += 1;
        listings.push(buildListing(countryEntry, cityEntry, propertyType));
      }
    });
  });

  return listings;
};

const seed = async () => {
  try {
    await connectDB();

    // Clean existing listings
    await Listing.deleteMany({});
    console.log('Cleared existing listings.');

    // Find or create seed user
    let user = await User.findOne({ email: 'seed@example.com' });
    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await User.create({
        username: 'SeedUser',
        email: 'seed@example.com',
        password: hashedPassword,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      });
      console.log('Created seed user (seed@example.com / password123)');
    } else {
      console.log('Seed user already exists.');
    }

    const generatedListings = generateListings();

    const listingsToInsert = generatedListings.map((listing) => ({
      ...listing,
      userRef: user._id.toString(),
    }));

    await Listing.insertMany(listingsToInsert);
    console.log(`Successfully seeded ${listingsToInsert.length} properties across ${COUNTRIES.length} countries!`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
