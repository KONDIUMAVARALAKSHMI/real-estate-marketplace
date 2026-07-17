import express from 'express';
import {
  createListing,
  getListing,
  getListings,
  updateListing,
  deleteListing,
  getPopularCities,
  getMarketplaceStats,
} from '../controllers/listing.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create', verifyToken, createListing);
router.get('/get', getListings);
router.get('/cities', getPopularCities);
router.get('/stats', getMarketplaceStats);
router.get('/get/:id', getListing);
router.put('/update/:id', verifyToken, updateListing);
router.delete('/delete/:id', verifyToken, deleteListing);

export default router;
