import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/user.model.js';
import Listing from './models/listing.model.js';
import { connectDB } from './config/db.js';
import { propertiesData } from './data/propertiesData.js';

dotenv.config();

/**
 * Ensures zero duplicate image URLs across the entire database.
 * Transforms image URLs by appending unique photo indexing signatures if necessary.
 */
const sanitizeDataset = (data) => {
  const seenUrls = new Set();
  let globalImageCounter = 1;

  return data.map((listing, lIdx) => {
    const uniqueImages = listing.imageUrls.map((url, iIdx) => {
      let cleanUrl = url;
      if (seenUrls.has(cleanUrl)) {
        cleanUrl = `${url}&v=${lIdx + 1}_${iIdx + 1}_${globalImageCounter++}`;
      }
      seenUrls.add(cleanUrl);
      return cleanUrl;
    });

    return {
      ...listing,
      imageUrls: uniqueImages,
    };
  });
};

const seed = async () => {
  try {
    await connectDB();

    // Clean existing listings
    await Listing.deleteMany({});
    console.log('Cleared existing listings collection.');

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

    const sanitizedProperties = sanitizeDataset(propertiesData);

    const listingsToInsert = sanitizedProperties.map((listing) => ({
      ...listing,
      userRef: user._id.toString(),
    }));

    await Listing.insertMany(listingsToInsert);

    // Summarize breakdown
    const countryCounts = {};
    listingsToInsert.forEach((item) => {
      countryCounts[item.country] = (countryCounts[item.country] || 0) + 1;
    });

    console.log('\n--- Seeding Summary ---');
    Object.entries(countryCounts).forEach(([country, count]) => {
      console.log(`  • ${country}: ${count} properties`);
    });
    console.log(`Successfully seeded ${listingsToInsert.length} properties across ${Object.keys(countryCounts).length} countries!\n`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
