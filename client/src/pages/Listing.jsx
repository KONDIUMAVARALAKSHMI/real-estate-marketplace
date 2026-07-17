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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <div className="flex items-center gap-2">
        <FaCalculator aria-hidden="true" className="text-slate-500" />
        <h3 className="text-base font-bold text-slate-900">Mortgage Estimate</h3>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        A rough estimate only — actual rates and terms depend on your lender.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="downPayment" className="mb-1 block text-xs font-semibold text-slate-600">
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
            className="w-full accent-slate-800"
          />
        </div>
        <div>
          <label htmlFor="interestRate" className="mb-1 block text-xs font-semibold text-slate-600">
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
            className="w-full accent-slate-800"
          />
        </div>
        <div>
          <label htmlFor="loanTerm" className="mb-1 block text-xs font-semibold text-slate-600">
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
            className="w-full accent-slate-800"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">Down Payment</p>
          <p className="mt-1 truncate text-lg font-bold text-slate-900">{fmt(downPaymentAmount)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">Loan Amount</p>
          <p className="mt-1 truncate text-lg font-bold text-slate-900">{fmt(loanAmount)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">Est. Monthly Payment</p>
          <p className="mt-1 truncate text-lg font-bold text-slate-900">{fmt(monthlyPayment)}</p>
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-lg font-semibold text-slate-600">Loading property...</div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="mb-4 font-semibold text-red-600">{error || 'Something went wrong.'}</p>
          <Link to="/" className="rounded-xl bg-slate-900 px-6 py-2.5 font-medium text-white transition hover:bg-slate-800">
            Back Home
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
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* Image Slider */}
      <div className="relative h-[450px] w-full overflow-hidden bg-slate-200 shadow-inner">
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
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/60 text-white backdrop-blur-sm transition hover:bg-slate-950/80"
            >
              <FaChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/60 text-white backdrop-blur-sm transition hover:bg-slate-950/80"
            >
              <FaChevronRight aria-hidden="true" />
            </button>

            <div className="absolute bottom-4 right-4">
              <span className="rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                {currentImageIndex + 1} / {totalImages}
              </span>
            </div>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {listing.imageUrls.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to image ${idx + 1}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    idx === currentImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Save / Share actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            type="button"
            onClick={handleFavoriteToggle}
            aria-label={favorite ? 'Remove from saved properties' : 'Save property'}
            aria-pressed={favorite}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            {favorite ? <FaHeart aria-hidden="true" /> : <FaRegHeart aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share property"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
          >
            <FaShareAlt aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Copy link to this property"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
          >
            <FaLink aria-hidden="true" />
          </button>
        </div>
        {linkCopied && (
          <div className="absolute top-16 right-4 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
            Link copied!
          </div>
        )}
      </div>

      <div className="mx-auto mt-8 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* Header section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white ${isRent ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                  For {listing.type}
                </span>
                {listing.offer && (
                  <span className="inline-flex rounded-full bg-rose-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Special Offer
                  </span>
                )}
                {badges.map((badge) => (
                  <span key={badge} className="inline-flex rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    {badge}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  <FaCheckCircle aria-hidden="true" /> Verified
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-extrabold text-slate-900">{listing.title}</h1>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <FaMapMarkerAlt aria-hidden="true" className="shrink-0 text-slate-400" />
                <span>{listing.address}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                <FaHashtag aria-hidden="true" />
                <span>Property ID: {listing._id}</span>
              </div>
            </div>

            <div className="min-w-0 max-w-full text-right sm:self-center">
              <span className="block max-w-full break-words text-3xl font-black text-slate-900">
                {formatPrice(displayPrice, selectedCountry, exchangeRates)}
                {isRent && <span className="text-sm font-normal text-slate-500"> / month</span>}
              </span>
              {listing.offer && (
                <span className="block max-w-full break-words text-sm font-bold text-slate-400 line-through">
                  Regular: {formatPrice(listing.price, selectedCountry, exchangeRates)}
                </span>
              )}
            </div>
          </div>

          {/* Key Specs */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-y border-slate-100 py-6 sm:grid-cols-4">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <FaBed aria-hidden="true" className="text-2xl text-slate-500" />
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-400">Beds</span>
                <span className="text-sm font-bold text-slate-800">{listing.bedrooms}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <FaBath aria-hidden="true" className="text-2xl text-slate-500" />
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-400">Baths</span>
                <span className="text-sm font-bold text-slate-800">{listing.bathrooms}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <FaParking aria-hidden="true" className="text-2xl text-slate-500" />
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-400">Parking</span>
                <span className="text-sm font-bold text-slate-800">{listing.parking ? 'Yes' : 'No'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <FaChair aria-hidden="true" className="text-2xl text-slate-500" />
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-400">Furnished</span>
                <span className="text-sm font-bold text-slate-800">{listing.furnished ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900">About this property</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-600">{listing.description}</p>
          </div>

          {/* Property Features / Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div className="mt-8 border-t border-slate-100 pt-8">
              <h2 className="text-xl font-bold text-slate-900">Property Features</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {listing.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                    <FaCheckCircle aria-hidden="true" className="shrink-0 text-emerald-500" />
                    <span className="truncate">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property Location + Nearby */}
          {listing.latitude != null && listing.longitude != null && (
            <div className="mt-8 border-t border-slate-100 pt-8">
              <h2 className="text-xl font-bold text-slate-900">Property Location</h2>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
                <FaMapMarkerAlt aria-hidden="true" className="shrink-0 text-slate-400" />
                <span>{listing.address}</span>
                <span className="text-slate-300">&middot;</span>
                <span>{[listing.city, listing.state, listing.country].filter(Boolean).join(', ')}</span>
                <span className="text-slate-300">&middot;</span>
                <span className="font-mono text-xs">
                  {Number(listing.latitude).toFixed(4)}, {Number(listing.longitude).toFixed(4)}
                </span>
              </div>
              <div className="mt-4">
                <Map latitude={listing.latitude} longitude={listing.longitude} title={listing.title} interactive={false} />
              </div>

              {/* Nearby distance-based indicators */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <FaWalking aria-hidden="true" className="text-lg text-slate-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Walk Score</p>
                    <p className="text-sm font-bold text-slate-800">{nearby.walkScore} · {walkScoreLabel(nearby.walkScore)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <FaSchool aria-hidden="true" className="text-lg text-slate-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Nearest School</p>
                    <p className="text-sm font-bold text-slate-800">{nearby.nearestSchoolKm} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <FaHospital aria-hidden="true" className="text-lg text-slate-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Nearest Hospital</p>
                    <p className="text-sm font-bold text-slate-800">{nearby.nearestHospitalKm} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <FaPlane aria-hidden="true" className="text-lg text-slate-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Nearest Airport</p>
                    <p className="text-sm font-bold text-slate-800">{nearby.nearestAirportKm} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <FaSubway aria-hidden="true" className="text-lg text-slate-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Nearest Metro</p>
                    <p className="text-sm font-bold text-slate-800">{nearby.nearestMetroKm} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <FaUtensils aria-hidden="true" className="text-lg text-slate-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Restaurants Nearby</p>
                    <p className="text-sm font-bold text-slate-800">{nearby.restaurantsWithin1km}+ within 1km</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Distances are estimates based on the property&apos;s coordinates and are provided for general guidance only.
              </p>
            </div>
          )}

          {/* Mortgage Estimate (sale listings only) */}
          {!isRent && (
            <div className="mt-8 border-t border-slate-100 pt-8">
              <MortgageCalculator
                priceInLocalCurrency={priceInLocalCurrency}
                selectedCountry={selectedCountry}
              />
            </div>
          )}

          {/* Contact Landlord */}
          {showContactButton && (
            <div className="mt-8 border-t border-slate-100 pt-8">
              {!showContact ? (
                <button
                  type="button"
                  onClick={handleContactClick}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 font-semibold text-white transition hover:bg-slate-800"
                >
                  <FaEnvelope aria-hidden="true" /> Contact Landlord
                </button>
              ) : (
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Send a message to {landlord?.username}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      This will open your email client prefilled with your message.
                    </p>
                  </div>
                  <label htmlFor="landlord-message" className="sr-only">Message</label>
                  <textarea
                    id="landlord-message"
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message here..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                  />
                  <div className="flex gap-3">
                    <a
                      href={`mailto:${landlord?.email}?subject=Inquiry regarding ${encodeURIComponent(listing.title)}&body=${encodeURIComponent(message)}`}
                      className="flex-1 rounded-xl bg-slate-900 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Send Email
                    </a>
                    <button
                      type="button"
                      onClick={() => setShowContact(false)}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <div className="mt-8 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Interested in this property?{' '}
                <Link to="/sign-in" className="font-semibold text-slate-900 hover:underline">
                  Sign in
                </Link>{' '}
                to contact the landlord.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Listing;
