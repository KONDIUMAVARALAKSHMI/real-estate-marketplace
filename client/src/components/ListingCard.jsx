import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaMapMarkerAlt, FaBed, FaBath, FaParking, FaChair, FaHeart, FaRegHeart, FaCheckCircle } from 'react-icons/fa';
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
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/listing/${listing._id}`}>
        <div className="relative h-56 w-full overflow-hidden bg-slate-100">
          <img
            src={listing.imageUrls[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 flex max-w-[75%] flex-wrap gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm ${
              isRent ? 'bg-blue-600' : 'bg-emerald-600'
            }`}>
              For {listing.type}
            </span>
            {listing.offer && (
              <span className="inline-flex rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm">
                Special Offer
              </span>
            )}
            {badges.slice(0, 2).map((badge) => (
              <span key={badge} className="inline-flex rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm">
                {badge}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={favorite ? 'Remove from saved properties' : 'Save property'}
            aria-pressed={favorite}
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            {favorite ? <FaHeart aria-hidden="true" /> : <FaRegHeart aria-hidden="true" />}
          </button>

          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
              {listing.city}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
              {listing.country}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-xl font-bold text-slate-900 transition-colors group-hover:text-slate-800">
              {listing.title}
            </h3>
            <span
              title="Verified listing"
              className="mt-0.5 flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600"
            >
              <FaCheckCircle aria-hidden="true" /> Verified
            </span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <FaMapMarkerAlt aria-hidden="true" className="shrink-0 text-slate-400" />
            <p className="line-clamp-1">{listing.address}</p>
          </div>

          <p className="mt-4 line-clamp-2 text-sm text-slate-500">
            {listing.description}
          </p>

          <div className="mt-5 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="min-w-0 max-w-full break-words text-2xl font-extrabold text-slate-900">
              {formatPrice(displayPrice, selectedCountry, exchangeRates)}
              {isRent && <span className="text-sm font-normal text-slate-500"> / month</span>}
            </span>
            {listing.offer && (
              <span className="min-w-0 max-w-full break-words text-sm font-semibold text-slate-400 line-through">
                {formatPrice(listing.price, selectedCountry, exchangeRates)}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1">
              <FaBed aria-hidden="true" className="text-slate-400" />
              <span>{listing.bedrooms} {listing.bedrooms === 1 ? 'bed' : 'beds'}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaBath aria-hidden="true" className="text-slate-400" />
              <span>{listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'}</span>
            </div>
            {listing.parking && (
              <div className="flex items-center gap-1">
                <FaParking aria-hidden="true" className="text-slate-400" />
                <span>Parking</span>
              </div>
            )}
            {listing.furnished && (
              <div className="flex items-center gap-1">
                <FaChair aria-hidden="true" className="text-slate-400" />
                <span>Furnished</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default memo(ListingCard);
