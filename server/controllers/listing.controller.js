import Listing from '../models/listing.model.js';
import { createError } from '../utils/error.js';

// Helper function to calculate distance using Haversine formula
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const createListing = async (req, res, next) => {
  try {
    const {
      title,
      description,
      address,
      price,
      discountPrice,
      bedrooms,
      bathrooms,
      furnished,
      parking,
      type,
      offer,
      imageUrls,
      country,
      state,
      city,
      latitude,
      longitude,
    } = req.body;

    if (
      !title ||
      !description ||
      !address ||
      price === undefined ||
      discountPrice === undefined ||
      bedrooms === undefined ||
      bathrooms === undefined ||
      furnished === undefined ||
      parking === undefined ||
      !type ||
      offer === undefined ||
      !imageUrls ||
      !Array.isArray(imageUrls) ||
      !country ||
      !state ||
      !city ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return next(createError(400, 'All fields including location details are required.'));
    }

    if (offer && Number(discountPrice) >= Number(price)) {
      return next(createError(400, 'Discount price must be less than regular price.'));
    }

    const newListing = await Listing.create({
      ...req.body,
      userRef: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Listing created successfully.',
      data: newListing,
    });
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(createError(404, 'Listing not found.'));
    }
    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = parseInt(req.query.startIndex, 10) || 0;

    const query = {};
    const searchTerm = req.query.searchTerm?.trim() || '';

    // Search term matching multiple fields
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { address: { $regex: searchTerm, $options: 'i' } },
        { city: { $regex: searchTerm, $options: 'i' } },
        { state: { $regex: searchTerm, $options: 'i' } },
        { country: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    // Specific Location Filters
    if (req.query.country && req.query.country !== 'all') {
      query.country = { $regex: `^${req.query.country.trim()}$`, $options: 'i' };
    }
    if (req.query.state && req.query.state !== 'all') {
      query.state = { $regex: req.query.state.trim(), $options: 'i' };
    }
    if (req.query.city && req.query.city !== 'all') {
      query.city = { $regex: req.query.city.trim(), $options: 'i' };
    }

    // Price Range Filter (USD values sent from client)
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = Number(req.query.maxPrice);
      }
    }

    const type = req.query.type?.toLowerCase();
    if (type === 'sale' || type === 'rent') {
      query.type = type;
    }

    if (req.query.parking === 'true') {
      query.parking = true;
    }

    if (req.query.furnished === 'true') {
      query.furnished = true;
    }

    if (req.query.offer === 'true') {
      query.offer = true;
    }

    if (req.query.tier && ['affordable', 'mid', 'luxury'].includes(req.query.tier)) {
      query.tier = req.query.tier;
    }

    if (req.query.minBedrooms) {
      query.bedrooms = { $gte: Number(req.query.minBedrooms) };
    }

    if (req.query.minBathrooms) {
      query.bathrooms = { $gte: Number(req.query.minBathrooms) };
    }

    const sort = req.query.sort || 'createdAt';
    const orderValue = req.query.order === 'asc' ? 1 : -1;

    const isNearby = req.query.nearby === 'true';
    const userLat = parseFloat(req.query.latitude);
    const userLng = parseFloat(req.query.longitude);

    let listings;

    if (isNearby && !isNaN(userLat) && !isNaN(userLng)) {
      // For nearby sorting: fetch all matching results, calculate distance, sort, and slice
      const allMatches = await Listing.find(query);
      
      // Calculate distance and attach to temp array
      const sortedMatches = allMatches.map(listing => {
        const dist = getDistance(
          userLat,
          userLng,
          listing.latitude || 0,
          listing.longitude || 0
        );
        return { ...listing.toObject(), distance: dist };
      }).sort((a, b) => a.distance - b.distance);

      listings = sortedMatches.slice(startIndex, startIndex + limit);
    } else {
      // Standard MongoDB sorting and pagination
      listings = await Listing.find(query)
        .sort({ [sort]: orderValue })
        .skip(startIndex)
        .limit(limit);
    }

    res.status(200).json({
      success: true,
      data: listings,
    });
  } catch (error) {
    console.error('Error in getListings:', error);
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(createError(404, 'Listing not found.'));
    }

    if (req.user.userId !== listing.userRef.toString()) {
      return next(createError(403, 'You can only update your own listings.'));
    }

    const { price, discountPrice, offer } = req.body;
    if (offer && discountPrice !== undefined && price !== undefined && Number(discountPrice) >= Number(price)) {
      return next(createError(400, 'Discount price must be less than regular price.'));
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully.',
      data: updatedListing,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(createError(404, 'Listing not found.'));
    }

    if (req.user.userId !== listing.userRef.toString()) {
      return next(createError(403, 'You can only delete your own listings.'));
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Returns the most-listed cities for a country (or globally), with a
// property count and average price per city — powers the "Popular Cities" section.
export const getPopularCities = async (req, res, next) => {
  try {
    const match = {};
    if (req.query.country && req.query.country !== 'all') {
      match.country = { $regex: `^${req.query.country.trim()}$`, $options: 'i' };
    }

    const limit = parseInt(req.query.limit, 10) || 6;

    const cities = await Listing.aggregate([
      { $match: match },
      {
        $group: {
          _id: { city: '$city', country: '$country' },
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          sampleImage: { $first: '$imageUrls' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          city: '$_id.city',
          country: '$_id.country',
          count: 1,
          avgPrice: { $round: ['$avgPrice', 0] },
          sampleImage: { $arrayElemAt: ['$sampleImage', 0] },
        },
      },
    ]);

    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    next(error);
  }
};

// Returns marketplace-wide statistics (used by the Home page statistics section)
export const getMarketplaceStats = async (req, res, next) => {
  try {
    const [totalProperties, countries, cities] = await Promise.all([
      Listing.countDocuments({}),
      Listing.distinct('country'),
      Listing.distinct('city'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProperties,
        totalCountries: countries.length,
        totalCities: cities.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
