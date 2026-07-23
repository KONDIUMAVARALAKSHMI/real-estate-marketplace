import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaMapMarkerAlt, FaBed, FaBath, FaParking, FaChair, FaHeart, FaRegHeart } from 'react-icons/fa';
import { formatPrice } from '../utils/currency.js';
import { computeBadges } from '../utils/badges.js';
import { isFavorite, toggleFavorite } from '../utils/favorites.js';

function ListingCard({ listing }) {
  const { selectedCountry, exchangeRates } = useSelector((state) => state.marketplace);
  const displayPrice = listing.offer ? listing.discountPrice : listing.price;
  const isRent = listing.type === 'rent';
  const badges = computeBadges(listing);
  const [favorite, setFavorite] = useState(() => isFavorite(listing._id));

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(listing._id);
    setFavorite((prev) => !prev);
  };

  return (
    <article
      className="group relative overflow-hidden rounded-[2rem] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl bg-white dark:bg-[#102F15] shadow-lg border border-gray-100 dark:border-white/10"
    >
      <Link to={`/listing/${listing._id}`}>
        {/* ── Image — Clean, No overlays except Favorite ─────────── */}
        <div className="relative h-64 w-full overflow-hidden bg-gray-100 dark:bg-black/20">
          <img
            src={listing.imageUrls[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Favorite button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={favorite ? 'Remove from saved properties' : 'Save property'}
            aria-pressed={favorite}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full shadow-md transition hover:scale-110 focus:outline-none bg-white/90 dark:bg-[#102F15]/90 backdrop-blur-sm"
          >
            {favorite ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-500 dark:text-gray-300" />}
          </button>
        </div>

        {/* ── Card Body ─────────────────────────── */}
        <div className="p-6">
          
          {/* Title */}
          <h3
            className="line-clamp-1 text-xl font-bold leading-snug transition-colors text-[#102F15] dark:text-white group-hover:text-[#728C5A] dark:group-hover:text-[#EBFADC]"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            {listing.title}
          </h3>

          {/* Address */}
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <FaMapMarkerAlt className="shrink-0 text-[#728C5A]" />
            <p className="line-clamp-1">{listing.address}</p>
          </div>

          {/* Price */}
          <div className="mt-4">
            <span
              className="text-2xl font-extrabold text-[#102F15] dark:text-white tracking-tight"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              {formatPrice(displayPrice, selectedCountry, exchangeRates)}
            </span>
          </div>

          {/* Amenity chips */}
          <div
            className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-gray-600 dark:text-gray-300"
          >
            <div className="flex items-center gap-2">
              <FaBed className="text-[#728C5A]" />
              <span>{listing.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBath className="text-[#728C5A]" />
              <span>{listing.bathrooms} Baths</span>
            </div>
            {listing.parking && (
              <div className="flex items-center gap-2">
                <FaParking className="text-[#728C5A]" />
                <span>Parking</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default memo(ListingCard);
