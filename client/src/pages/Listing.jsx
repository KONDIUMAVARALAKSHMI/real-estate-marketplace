import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaMapMarkerAlt, FaBed, FaBath, FaParking, FaChair, FaEnvelope,
  FaChevronLeft, FaChevronRight, FaCheckCircle, FaHeart, FaRegHeart,
  FaShareAlt, FaLink, FaSchool, FaHospital, FaPlane, FaSubway, FaUtensils,
  FaWalking, FaCalculator, FaHashtag,
} from 'react-icons/fa';
import api from '../services/api.js';
import Map from '../components/Map.jsx';
import { formatPrice, formatLocalAmount, convertPrice } from '../utils/currency.js';
import { computeBadges } from '../utils/badges.js';
import { isFavorite, toggleFavorite } from '../utils/favorites.js';
import { getNearbyIndicators, walkScoreLabel } from '../utils/nearby.js';

function MortgageCalculator({ priceInLocalCurrency, selectedCountry }) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTermYears, setLoanTermYears] = useState(30);

  const { monthlyPayment, loanAmount, downPaymentAmount } = useMemo(() => {
    const dp = (priceInLocalCurrency * downPaymentPercent) / 100;
    const principal = priceInLocalCurrency - dp;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTermYears * 12;

    let payment;
    if (monthlyRate > 0) {
      payment = (principal * monthlyRate * (1 + monthlyRate) ** numPayments) /
        ((1 + monthlyRate) ** numPayments - 1);
    } else {
      payment = principal / numPayments;
    }

    return { monthlyPayment: payment, loanAmount: principal, downPaymentAmount: dp };
  }, [priceInLocalCurrency, downPaymentPercent, interestRate, loanTermYears]);

  const fmt = (val) => formatLocalAmount(val, selectedCountry);

  return (
    <div className="rounded-2xl border p-6 bg-white dark:bg-[#102F15] border-[#728C5A]/20 dark:border-white/10 transition-colors">
      <div className="flex items-center gap-2">
        <FaCalculator aria-hidden="true" className="text-[#728C5A]" />
        <h3 className="text-base font-bold text-[#102F15] dark:text-white">Mortgage Estimate</h3>
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        A rough estimate only — actual rates and terms depend on your lender.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="downPayment" className="mb-1 block text-xs font-semibold text-[#102F15] dark:text-white">
            Down Payment ({downPaymentPercent}%)
          </label>
          <input
            id="downPayment"
            type="range"
            min="0"
            max="90"
            step="5"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full accent-[#728C5A]"
          />
        </div>
        <div>
          <label htmlFor="interestRate" className="mb-1 block text-xs font-semibold text-[#102F15] dark:text-white">
            Interest Rate ({interestRate}%)
          </label>
          <input
            id="interestRate"
            type="range"
            min="1"
            max="15"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full accent-[#728C5A]"
          />
        </div>
        <div>
          <label htmlFor="loanTerm" className="mb-1 block text-xs font-semibold text-[#102F15] dark:text-white">
            Loan Term ({loanTermYears} yrs)
          </label>
          <input
            id="loanTerm"
            type="range"
            min="5"
            max="30"
            step="5"
            value={loanTermYears}
            onChange={(e) => setLoanTermYears(Number(e.target.value))}
            className="w-full accent-[#728C5A]"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-3" style={{ borderColor: '#E8DDD4' }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#98755B' }}>Down Payment</p>
          <p className="mt-1 truncate text-lg font-bold" style={{ color: '#2C1B14' }}>{fmt(downPaymentAmount)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#98755B' }}>Loan Amount</p>
          <p className="mt-1 truncate text-lg font-bold" style={{ color: '#2C1B14' }}>{fmt(loanAmount)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#98755B' }}>Est. Monthly Payment</p>
          <p className="mt-1 truncate text-lg font-bold" style={{ color: '#2C1B14' }}>{fmt(monthlyPayment)}</p>
        </div>
      </div>
    </div>
  );
}

function Listing() {
  const { id } = useParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { selectedCountry, exchangeRates } = useSelector((state) => state.marketplace);

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [landlord, setLandlord] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState('');

  const [favorite, setFavorite] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/listing/get/${id}`);
        if (res.data.success) {
          setListing(res.data.data);
          setCurrentImageIndex(0);
          setFavorite(isFavorite(res.data.data._id));
        }
      } catch (err) {
        console.error('Failed to fetch listing', err);
        setError('Listing not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleContactClick = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get(`/user/${listing.userRef}`);
      if (res.data.success) {
        setLandlord(res.data.data);
        setShowContact(true);
      }
    } catch (err) {
      console.error('Failed to load contact info', err);
      setError('Could not retrieve landlord contact info.');
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? listing.imageUrls.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === listing.imageUrls.length - 1 ? 0 : prev + 1));
  };

  const handleFavoriteToggle = () => {
    toggleFavorite(listing._id);
    setFavorite((prev) => !prev);
  };

  const handleShare = async () => {
    const shareData = {
      title: listing.title,
      text: `Check out this property: ${listing.title}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled share sheet — no action needed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EBFADC] dark:bg-[#102F15]">
        <div className="text-lg font-semibold text-[#728C5A] animate-pulse">Loading property details...</div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EBFADC] dark:bg-[#102F15]">
        <div className="max-w-md rounded-3xl border p-8 text-center shadow-sm bg-white dark:bg-[#102F15] border-[#728C5A]/20 dark:border-white/10">
          <p className="mb-4 font-semibold text-red-500">{error || 'Something went wrong.'}</p>
          <Link
            to="/"
            className="rounded-xl px-6 py-2.5 font-medium text-white transition bg-[#728C5A] hover:bg-[#61784c]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = listing.offer ? listing.discountPrice : listing.price;
  const isRent = listing.type === 'rent';
  const showContactButton = isAuthenticated && user && listing.userRef !== user._id;
  const totalImages = listing.imageUrls.length;
  const badges = computeBadges(listing);
  const nearby = getNearbyIndicators(listing._id);
  const priceInLocalCurrency = convertPrice(listing.price, selectedCountry, exchangeRates);

  return (
    <main className="min-h-screen pb-24 bg-[#EBFADC] dark:bg-[#102F15] transition-colors duration-500 pt-16">
      
      {/* ── Image Gallery Slider ────────────────────────── */}
      <div className="relative h-[550px] w-full overflow-hidden bg-black/80">
        <img
          src={listing.imageUrls[currentImageIndex] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'}
          alt={`${listing.title} — photo ${currentImageIndex + 1} of ${totalImages}`}
          className="h-full w-full object-cover transition-opacity duration-300"
        />

        {totalImages > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={handlePrevImage}
              className="absolute left-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 hover:scale-105"
            >
              <FaChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={handleNextImage}
              className="absolute right-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 hover:scale-105"
            >
              <FaChevronRight aria-hidden="true" />
            </button>

            <div className="absolute bottom-6 right-6">
              <span className="rounded-full bg-black/50 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md border border-white/20">
                {currentImageIndex + 1} / {totalImages}
              </span>
            </div>

            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
              {listing.imageUrls.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to image ${idx + 1}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    idx === currentImageIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Action Buttons Overlay */}
        <div className="absolute top-6 right-6 flex gap-3">
          <button
            type="button"
            onClick={handleFavoriteToggle}
            aria-label={favorite ? 'Remove from saved properties' : 'Save property'}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 dark:bg-[#102F15]/90 dark:text-white shadow-lg transition hover:scale-110"
          >
            {favorite ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-500" />}
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share property"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 dark:bg-[#102F15]/90 dark:text-white shadow-lg transition hover:scale-110 text-gray-700"
          >
            <FaShareAlt aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Copy link"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 dark:bg-[#102F15]/90 dark:text-white shadow-lg transition hover:scale-110 text-gray-700"
          >
            <FaLink aria-hidden="true" />
          </button>
        </div>
        {linkCopied && (
          <div className="absolute top-20 right-6 rounded-full px-4 py-2 text-xs font-bold text-white shadow-lg bg-[#728C5A]">
            Link copied!
          </div>
        )}
      </div>

      {/* ── Content ────────────────────────────── */}
      <div className="mx-auto mt-[-40px] max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className="rounded-[2.5rem] p-8 shadow-2xl sm:p-12 bg-white dark:bg-[#102F15] border border-[#728C5A]/10 dark:border-white/10 transition-colors duration-500"
        >
          {/* Header Row */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-[#728C5A]"
                >
                  For {listing.type}
                </span>
                {listing.offer && (
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700"
                  >
                    Special Offer
                  </span>
                )}
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-white/10 text-[#728C5A] dark:text-gray-300 border border-[#728C5A]/20 dark:border-white/10"
                  >
                    {badge}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  <FaCheckCircle aria-hidden="true" /> Verified
                </span>
              </div>

              {/* Title & Location */}
              <h1
                className="text-4xl sm:text-5xl font-extrabold leading-[1.1] text-[#102F15] dark:text-white"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                {listing.title}
              </h1>
              <div className="mt-4 flex items-center gap-2 text-base text-gray-500 dark:text-gray-400">
                <FaMapMarkerAlt aria-hidden="true" className="text-[#728C5A]" />
                <span>{listing.address}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <FaHashtag aria-hidden="true" />
                <span>Ref ID: {listing._id}</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="shrink-0 lg:text-right">
              <span
                className="block text-4xl sm:text-5xl font-black break-words text-[#102F15] dark:text-white"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                {formatPrice(displayPrice, selectedCountry, exchangeRates)}
                {isRent && <span className="text-xl font-normal text-gray-500 dark:text-gray-400"> /mo</span>}
              </span>
              {listing.offer && (
                <span className="mt-1 block text-sm font-bold line-through text-gray-400">
                  Regular: {formatPrice(listing.price, selectedCountry, exchangeRates)}
                </span>
              )}
            </div>
          </div>

          {/* Key Specs Grid */}
          <div className="mt-12 grid grid-cols-2 gap-4 border-y py-8 sm:grid-cols-4 border-[#728C5A]/10 dark:border-white/10">
            <div className="flex items-center gap-4 rounded-2xl p-5 bg-[#EBFADC]/30 dark:bg-black/20">
              <FaBed aria-hidden="true" className="text-3xl text-[#728C5A]" />
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#728C5A] dark:text-gray-400">Beds</span>
                <span className="text-lg font-bold text-[#102F15] dark:text-white">{listing.bedrooms}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl p-5 bg-[#EBFADC]/30 dark:bg-black/20">
              <FaBath aria-hidden="true" className="text-3xl text-[#728C5A]" />
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#728C5A] dark:text-gray-400">Baths</span>
                <span className="text-lg font-bold text-[#102F15] dark:text-white">{listing.bathrooms}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl p-5 bg-[#EBFADC]/30 dark:bg-black/20">
              <FaParking aria-hidden="true" className="text-3xl text-[#728C5A]" />
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#728C5A] dark:text-gray-400">Parking</span>
                <span className="text-lg font-bold text-[#102F15] dark:text-white">{listing.parking ? 'Included' : 'None'}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl p-5 bg-[#EBFADC]/30 dark:bg-black/20">
              <FaChair aria-hidden="true" className="text-3xl text-[#728C5A]" />
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#728C5A] dark:text-gray-400">Furnished</span>
                <span className="text-lg font-bold text-[#102F15] dark:text-white">{listing.furnished ? 'Yes' : 'Unfurnished'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-[#102F15] dark:text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>About this residence</h2>
            <p className="mt-6 whitespace-pre-line leading-loose text-lg text-gray-600 dark:text-gray-300">
              {listing.description}
            </p>
          </div>

          {/* Amenities List */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div className="mt-12 border-t pt-10 border-[#728C5A]/10 dark:border-white/10">
              <h2 className="text-2xl font-bold text-[#102F15] dark:text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Premium Features</h2>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {listing.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium bg-[#EBFADC]/30 dark:bg-black/20 text-[#102F15] dark:text-white">
                    <FaCheckCircle aria-hidden="true" className="shrink-0 text-[#728C5A]" />
                    <span className="truncate">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location & Map & Nearby */}
          {listing.latitude != null && listing.longitude != null && (
            <div className="mt-12 border-t pt-10 border-[#728C5A]/10 dark:border-white/10">
              <h2 className="text-2xl font-bold text-[#102F15] dark:text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Location & Neighborhood</h2>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <FaMapMarkerAlt aria-hidden="true" className="text-[#728C5A]" />
                <span>{listing.address}</span>
                <span className="text-gray-300 dark:text-gray-700">&middot;</span>
                <span className="font-semibold">{[listing.city, listing.state, listing.country].filter(Boolean).join(', ')}</span>
              </div>
              <div className="mt-6 rounded-2xl overflow-hidden border border-[#728C5A]/20 dark:border-white/10">
                <Map latitude={listing.latitude} longitude={listing.longitude} title={listing.title} interactive={false} />
              </div>

              {/* Nearby Indicators Grid */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl p-4 border bg-white dark:bg-[#102F15] border-[#728C5A]/20 dark:border-white/10 transition-colors">
                  <FaWalking aria-hidden="true" className="text-2xl text-[#728C5A]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#728C5A] dark:text-gray-400">Walk Score</p>
                    <p className="text-sm font-bold mt-0.5 text-[#102F15] dark:text-white">{nearby.walkScore} · {walkScoreLabel(nearby.walkScore)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-4 border bg-white dark:bg-[#102F15] border-[#728C5A]/20 dark:border-white/10 transition-colors">
                  <FaSchool aria-hidden="true" className="text-2xl text-[#728C5A]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#728C5A] dark:text-gray-400">Nearest School</p>
                    <p className="text-sm font-bold mt-0.5 text-[#102F15] dark:text-white">{nearby.nearestSchoolKm} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-4 border bg-white dark:bg-[#102F15] border-[#728C5A]/20 dark:border-white/10 transition-colors">
                  <FaHospital aria-hidden="true" className="text-2xl text-[#728C5A]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#728C5A] dark:text-gray-400">Nearest Hospital</p>
                    <p className="text-sm font-bold mt-0.5 text-[#102F15] dark:text-white">{nearby.nearestHospitalKm} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-4 border bg-white dark:bg-[#102F15] border-[#728C5A]/20 dark:border-white/10 transition-colors">
                  <FaPlane aria-hidden="true" className="text-2xl text-[#728C5A]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#728C5A] dark:text-gray-400">Nearest Airport</p>
                    <p className="text-sm font-bold mt-0.5 text-[#102F15] dark:text-white">{nearby.nearestAirportKm} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-4 border bg-white dark:bg-[#102F15] border-[#728C5A]/20 dark:border-white/10 transition-colors">
                  <FaSubway aria-hidden="true" className="text-2xl text-[#728C5A]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#728C5A] dark:text-gray-400">Nearest Metro</p>
                    <p className="text-sm font-bold mt-0.5 text-[#102F15] dark:text-white">{nearby.nearestMetroKm} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-4 border bg-white dark:bg-[#102F15] border-[#728C5A]/20 dark:border-white/10 transition-colors">
                  <FaUtensils aria-hidden="true" className="text-2xl text-[#728C5A]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#728C5A] dark:text-gray-400">Dining</p>
                    <p className="text-sm font-bold mt-0.5 text-[#102F15] dark:text-white">{nearby.restaurantsWithin1km}+ within 1km</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mortgage Calculator */}
          {!isRent && (
            <div className="mt-12 border-t pt-10 border-[#728C5A]/10 dark:border-white/10">
              <MortgageCalculator
                priceInLocalCurrency={priceInLocalCurrency}
                selectedCountry={selectedCountry}
              />
            </div>
          )}

          {/* Contact Action Section */}
          {showContactButton && (
            <div className="mt-12 border-t pt-10 border-[#728C5A]/10 dark:border-white/10">
              {!showContact ? (
                <button
                  type="button"
                  onClick={handleContactClick}
                  className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-lg font-bold text-white shadow-xl transition bg-[#728C5A] hover:bg-[#61784c] dark:bg-[#728C5A] dark:hover:bg-[#839b6b]"
                >
                  <FaEnvelope aria-hidden="true" /> Contact the Agent / Landlord
                </button>
              ) : (
                <div className="space-y-4 rounded-3xl p-8 border shadow-lg bg-white dark:bg-[#102F15] border-[#728C5A]/20 dark:border-white/10">
                  <div>
                    <h3 className="text-xl font-bold text-[#102F15] dark:text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                      Message {landlord?.username}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Click send to open your default email client.
                    </p>
                  </div>
                  <label htmlFor="landlord-message" className="sr-only">Message</label>
                  <textarea
                    id="landlord-message"
                    rows="5"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="I am interested in this property..."
                    className="w-full rounded-2xl border p-4 text-base outline-none transition bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white border-[#728C5A]/20 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                  />
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <a
                      href={`mailto:${landlord?.email}?subject=Inquiry regarding ${encodeURIComponent(listing.title)}&body=${encodeURIComponent(message)}`}
                      className="flex-1 rounded-full py-3.5 text-center font-bold text-white transition bg-[#728C5A] hover:bg-[#61784c]"
                    >
                      Open Email Client
                    </a>
                    <button
                      type="button"
                      onClick={() => setShowContact(false)}
                      className="rounded-full border-2 px-8 py-3.5 font-bold transition border-[#728C5A]/20 text-[#102F15] dark:text-white hover:bg-gray-50 dark:hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <div className="mt-12 border-t pt-8 text-center border-[#728C5A]/10 dark:border-white/10">
              <p className="text-base text-gray-500 dark:text-gray-400">
                Interested in this property?{' '}
                <Link to="/sign-in" className="font-bold hover:underline text-[#728C5A]">
                  Sign in to your account
                </Link>{' '}
                to contact the owner.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Listing;
