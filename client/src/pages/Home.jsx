import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaMapMarkerAlt, FaBed, FaBath, FaShieldAlt, FaUserCheck, FaGlobeAmericas,
  FaRobot, FaLock, FaHeadset, FaAward, FaStar,
} from 'react-icons/fa';
import api from '../services/api.js';
import ListingCard from '../components/ListingCard.jsx';
import { formatPrice } from '../utils/currency.js';

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function SectionHeader({ eyebrow, eyebrowClass, title, ctaTo, ctaLabel }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <p className={`text-sm font-semibold uppercase tracking-[0.3em] ${eyebrowClass}`}>{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-extrabold text-slate-900">{title}</h2>
      </div>
      {ctaTo && (
        <Link
          to={ctaTo}
          className="rounded-full border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

function CardSkeletonGrid({ count = 4 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="animate-pulse overflow-hidden rounded-3xl border border-slate-100 bg-slate-50">
          <div className="h-56 w-full bg-slate-200" />
          <div className="space-y-3 p-6">
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-200" />
            <div className="h-3 w-full rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Animated counter — counts up from 0 to `value` once it mounts.
function AnimatedCounter({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const startTime = performance.now();

          const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            setDisplay(Math.round(progress * value));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="text-4xl font-extrabold text-slate-900">
      {display.toLocaleString()}{suffix}
    </span>
  );
}

const TESTIMONIALS = [
  { name: 'Amelia Carter', country: 'United States', rating: 5, review: 'The country switcher made comparing listings across markets effortless. We found our New York apartment within a week.', initials: 'AC', color: 'bg-rose-500' },
  { name: 'Rohan Mehta', country: 'India', rating: 5, review: 'Transparent pricing and instant currency conversion took all the guesswork out of budgeting for our Hyderabad villa.', initials: 'RM', color: 'bg-amber-500' },
  { name: 'Yuki Tanaka', country: 'Japan', rating: 4, review: 'Clean interface, accurate maps, and a great selection of Tokyo apartments. Exactly what a busy professional needs.', initials: 'YT', color: 'bg-sky-500' },
  { name: 'Sophie Laurent', country: 'France', rating: 5, review: 'We compared Paris and Lyon side by side in minutes. The featured listings are genuinely useful, not just filler.', initials: 'SL', color: 'bg-emerald-500' },
  { name: 'Liam O\'Connor', country: 'United Kingdom', rating: 5, review: 'Searching by city and price range was seamless, and the mortgage estimate on the listing page helped us plan ahead.', initials: 'LO', color: 'bg-indigo-500' },
  { name: 'Fatima Al Suwaidi', country: 'United Arab Emirates', rating: 4, review: 'A polished, professional platform. The luxury collection badges made it easy to spot premium Dubai properties fast.', initials: 'FA', color: 'bg-fuchsia-500' },
];

const WHY_CHOOSE_ITEMS = [
  { icon: FaShieldAlt, title: 'Verified Listings', desc: 'Every property is reviewed for accurate details before it goes live.' },
  { icon: FaUserCheck, title: 'Verified Owners', desc: 'Listings are tied to authenticated accounts, reducing fraudulent posts.' },
  { icon: FaGlobeAmericas, title: 'Global Marketplace', desc: 'Browse properties across 10 countries from a single dashboard.' },
  { icon: FaRobot, title: 'AI Recommendations', desc: 'Featured picks adapt automatically to the country you\'re browsing.' },
  { icon: FaLock, title: 'Secure Transactions', desc: 'JWT-protected accounts keep your listings and profile data safe.' },
  { icon: FaHeadset, title: '24x7 Support', desc: 'Our team is on hand around the clock to help buyers and sellers.' },
  { icon: FaAward, title: 'Trusted Platform', desc: 'Thousands of properties and a growing community of happy users.' },
];

function Home() {
  const { selectedCountry, exchangeRates } = useSelector((state) => state.marketplace);

  const [offerListings, setOfferListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [luxuryListings, setLuxuryListings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [stats, setStats] = useState({ totalProperties: 0, totalCountries: 0, totalCities: 0 });
  const [loading, setLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(true);

  const [featuredListing, setFeaturedListing] = useState(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [hasAnyListings, setHasAnyListings] = useState(true);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Main listing sections stay in sync with the selected country
  useEffect(() => {
    const countryParam = `country=${encodeURIComponent(selectedCountry)}`;

    const fetchOfferListings = async () => {
      try {
        const res = await api.get(`/listing/get?offer=true&limit=12&${countryParam}`);
        if (res.data.success) setOfferListings(res.data.data);
      } catch (err) {
        console.error('Failed to fetch offer listings', err);
      }
    };

    const fetchRentListings = async () => {
      try {
        const res = await api.get(`/listing/get?type=rent&limit=12&${countryParam}`);
        if (res.data.success) setRentListings(res.data.data);
      } catch (err) {
        console.error('Failed to fetch rent listings', err);
      }
    };

    const fetchSaleListings = async () => {
      try {
        const res = await api.get(`/listing/get?type=sale&limit=12&${countryParam}`);
        if (res.data.success) setSaleListings(res.data.data);
      } catch (err) {
        console.error('Failed to fetch sale listings', err);
      }
    };

    const fetchLuxuryListings = async () => {
      try {
        const res = await api.get(`/listing/get?tier=luxury&limit=8&${countryParam}`);
        if (res.data.success) setLuxuryListings(res.data.data);
      } catch (err) {
        console.error('Failed to fetch luxury listings', err);
      }
    };

    const fetchRecentListings = async () => {
      try {
        const res = await api.get(`/listing/get?limit=8&sort=createdAt&order=desc&${countryParam}`);
        if (res.data.success) setRecentListings(res.data.data);
      } catch (err) {
        console.error('Failed to fetch recently added listings', err);
      }
    };

    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchOfferListings(),
        fetchRentListings(),
        fetchSaleListings(),
        fetchLuxuryListings(),
        fetchRecentListings(),
      ]);
      setLoading(false);
    };

    fetchAll();
  }, [selectedCountry]);

  // Popular cities for the selected country
  useEffect(() => {
    const fetchCities = async () => {
      setCitiesLoading(true);
      try {
        const res = await api.get(`/listing/cities?country=${encodeURIComponent(selectedCountry)}&limit=6`);
        if (res.data.success) setPopularCities(res.data.data);
      } catch (err) {
        console.error('Failed to fetch popular cities', err);
      } finally {
        setCitiesLoading(false);
      }
    };
    fetchCities();
  }, [selectedCountry]);

  // Marketplace-wide statistics (independent of selected country)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/listing/stats');
        if (res.data.success) setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch marketplace stats', err);
      }
    };
    fetchStats();
  }, []);

  // Featured property changes whenever the selected country changes
  useEffect(() => {
    const fetchFeaturedListing = async () => {
      setFeaturedLoading(true);
      try {
        const countryRes = await api.get(
          `/listing/get?country=${encodeURIComponent(selectedCountry)}&limit=1&sort=price&order=desc`
        );
        const found = countryRes.data.success && countryRes.data.data.length > 0
          ? countryRes.data.data[0]
          : null;

        setFeaturedListing(found);

        if (found) {
          setHasAnyListings(true);
        } else {
          const anyRes = await api.get('/listing/get?limit=1');
          setHasAnyListings(Boolean(anyRes.data.success && anyRes.data.data.length > 0));
        }
      } catch (err) {
        console.error('Failed to fetch featured listing', err);
        setFeaturedListing(null);
      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchFeaturedListing();
  }, [selectedCountry]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail('');
  };

  const noCountryListings = !loading && offerListings.length === 0 && rentListings.length === 0 && saleListings.length === 0 && luxuryListings.length === 0 && recentListings.length === 0;

  return (
    <main className="bg-slate-50 pb-16">
      {/* Hero Section */}
      <section className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-slate-200 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">
              Real estate marketplace
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Discover homes that fit your lifestyle.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Browse curated listings across ten countries, save favorites, and manage your account with a polished modern experience built for buyers, sellers, and renters.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/search?country=all"
                className="rounded-full bg-slate-800 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Start Exploring
              </Link>
              <Link to="/about" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-800 transition hover:border-slate-500 hover:text-slate-900">
                Learn more
              </Link>
            </div>
          </div>

          {/* Featured Property */}
          <div className="w-full min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-300/10">
            {featuredLoading ? (
              <div className="animate-pulse">
                <div className="h-56 w-full bg-slate-200" />
                <div className="space-y-3 p-6">
                  <div className="h-3 w-1/3 rounded bg-slate-200" />
                  <div className="h-6 w-3/4 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-8 w-1/2 rounded bg-slate-200" />
                </div>
              </div>
            ) : featuredListing ? (
              <article className="min-w-0">
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <img
                    src={featuredListing.imageUrls?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
                    alt={`Featured property: ${featuredListing.title}`}
                    loading="eager"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm">
                    Featured property
                  </span>
                </div>

                <div className="min-w-0 p-6">
                  <h2 className="line-clamp-1 text-xl font-bold text-slate-900">{featuredListing.title}</h2>

                  <div className="mt-2 flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
                    <FaMapMarkerAlt aria-hidden="true" className="shrink-0 text-slate-400" />
                    <p className="truncate">
                      {[featuredListing.city, featuredListing.country].filter(Boolean).join(', ')}
                    </p>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-slate-500">{featuredListing.description}</p>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-slate-100 pt-4">
                    <span className="min-w-0 max-w-full break-words text-2xl font-extrabold text-slate-900">
                      {formatPrice(
                        featuredListing.offer ? featuredListing.discountPrice : featuredListing.price,
                        selectedCountry,
                        exchangeRates
                      )}
                      {featuredListing.type === 'rent' && (
                        <span className="text-sm font-normal text-slate-500"> / month</span>
                      )}
                    </span>
                    <div className="flex shrink-0 items-center gap-3 text-xs font-medium text-slate-600">
                      <span className="flex items-center gap-1">
                        <FaBed aria-hidden="true" className="text-slate-400" /> {featuredListing.bedrooms} beds
                      </span>
                      <span className="flex items-center gap-1">
                        <FaBath aria-hidden="true" className="text-slate-400" /> {featuredListing.bathrooms} baths
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/listing/${featuredListing._id}`}
                    className="mt-5 block w-full rounded-full bg-slate-900 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Featured property</p>
                {hasAnyListings ? (
                  <p className="mt-4 text-lg font-semibold text-slate-700">
                    No properties available in this country yet.
                  </p>
                ) : (
                  <>
                    <p className="mt-4 text-lg font-semibold text-slate-700">No listings available yet.</p>
                    <p className="mt-2 text-sm text-slate-500">
                      <Link to="/create-listing" className="font-semibold text-slate-900 hover:underline">
                        Create the first listing
                      </Link>{' '}
                      to feature it here.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Popular Cities */}
        <section aria-labelledby="popular-cities-heading">
          <div className="mb-8 border-b border-slate-100 pb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Explore by city</p>
            <h2 id="popular-cities-heading" className="mt-2 text-3xl font-extrabold text-slate-900">Popular Cities</h2>
          </div>
          {citiesLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-32 animate-pulse rounded-3xl bg-slate-200" />
              ))}
            </div>
          ) : popularCities.length === 0 ? (
            <p className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm border border-slate-100">
              No city data available for this country yet.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popularCities.map((cityEntry) => (
                <Link
                  key={`${cityEntry.city}-${cityEntry.country}`}
                  to={`/search?city=${encodeURIComponent(cityEntry.city)}&country=${encodeURIComponent(cityEntry.country)}`}
                  className="group relative flex h-32 flex-col justify-end overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm transition hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                >
                  {cityEntry.sampleImage && (
                    <img
                      src={cityEntry.sampleImage}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-50 transition group-hover:scale-105 group-hover:opacity-40"
                    />
                  )}
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold">{cityEntry.city}</h3>
                    <p className="text-xs text-slate-200">
                      {cityEntry.count} Propert{cityEntry.count === 1 ? 'y' : 'ies'} · Avg{' '}
                      {formatPrice(cityEntry.avgPrice, selectedCountry, exchangeRates)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Dynamic listing sections */}
        <div className="mt-4 space-y-12">
          {loading ? (
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <CardSkeletonGrid count={4} />
            </div>
          ) : noCountryListings ? (
            <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">
              {hasAnyListings ? (
                <p className="text-lg font-semibold text-slate-700">
                  No properties available in this country yet.
                </p>
              ) : (
                <>
                  <p className="text-lg font-semibold text-slate-700">No listings yet.</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Be the first to{' '}
                    <Link to="/create-listing" className="font-semibold text-slate-900 hover:underline">
                      create a listing
                    </Link>
                    .
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Luxury Collection */}
              {luxuryListings.length > 0 && (
                <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm" aria-labelledby="luxury-heading">
                  <SectionHeader
                    eyebrow="Premium Selection"
                    eyebrowClass="text-amber-600"
                    title="Luxury Collection"
                    ctaTo="/search?tier=luxury"
                    ctaLabel="Show More Luxury"
                  />
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {luxuryListings.map((listing) => (
                      <ListingCard key={listing._id} listing={listing} />
                    ))}
                  </div>
                </section>
              )}

              {/* Offers */}
              {offerListings.length > 0 && (
                <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                  <SectionHeader
                    eyebrow="Great Deals"
                    eyebrowClass="text-rose-600"
                    title="Special Offers"
                    ctaTo="/search?offer=true"
                    ctaLabel="Show More Offers"
                  />
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {offerListings.map((listing) => (
                      <ListingCard key={listing._id} listing={listing} />
                    ))}
                  </div>
                </section>
              )}

              {/* Sales */}
              {saleListings.length > 0 && (
                <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                  <SectionHeader
                    eyebrow="Properties to Buy"
                    eyebrowClass="text-emerald-600"
                    title="Recent Sales"
                    ctaTo="/search?type=sale"
                    ctaLabel="Show More Sales"
                  />
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {saleListings.map((listing) => (
                      <ListingCard key={listing._id} listing={listing} />
                    ))}
                  </div>
                </section>
              )}

              {/* Rents */}
              {rentListings.length > 0 && (
                <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                  <SectionHeader
                    eyebrow="Leases Available"
                    eyebrowClass="text-blue-600"
                    title="Recent Rentals"
                    ctaTo="/search?type=rent"
                    ctaLabel="Show More Rentals"
                  />
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {rentListings.map((listing) => (
                      <ListingCard key={listing._id} listing={listing} />
                    ))}
                  </div>
                </section>
              )}

              {/* Recently Added */}
              {recentListings.length > 0 && (
                <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                  <SectionHeader
                    eyebrow="Fresh on the Market"
                    eyebrowClass="text-slate-500"
                    title="Recently Added"
                    ctaTo="/search?sort=createdAt&order=desc"
                    ctaLabel="Show More"
                  />
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {recentListings.map((listing) => (
                      <ListingCard key={listing._id} listing={listing} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* Why Choose EstateHub */}
        <section aria-labelledby="why-choose-heading">
          <div className="mb-8 border-b border-slate-100 pb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Our promise</p>
            <h2 id="why-choose-heading" className="mt-2 text-3xl font-extrabold text-slate-900">Why Choose EstateHub</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_CHOOSE_ITEMS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <Icon aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section aria-labelledby="testimonials-heading">
          <div className="mb-8 border-b border-slate-100 pb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Trusted worldwide</p>
            <h2 id="testimonials-heading" className="mt-2 text-3xl font-extrabold text-slate-900">What Our Users Say</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${t.color}`}>
                    {t.initials}
                  </span>
                  <div>
                    <figcaption className="text-sm font-bold text-slate-900">{t.name}</figcaption>
                    <p className="text-xs text-slate-500">{t.country}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-0.5 text-amber-400" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar key={i} aria-hidden="true" className={i < t.rating ? 'opacity-100' : 'opacity-20'} />
                  ))}
                </div>
                <blockquote className="mt-3 text-sm leading-6 text-slate-600">&ldquo;{t.review}&rdquo;</blockquote>
              </figure>
            ))}
          </div>
        </section>

        {/* Statistics */}
        <section className="rounded-3xl bg-slate-900 px-8 py-12 text-white" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">EstateHub statistics</h2>
          <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <AnimatedCounter value={stats.totalProperties || 0} suffix="+" />
              <p className="mt-2 text-sm text-slate-300">Properties</p>
            </div>
            <div>
              <AnimatedCounter value={stats.totalCountries || 0} />
              <p className="mt-2 text-sm text-slate-300">Countries</p>
            </div>
            <div>
              <AnimatedCounter value={stats.totalCities || 0} suffix="+" />
              <p className="mt-2 text-sm text-slate-300">Cities</p>
            </div>
            <div>
              <AnimatedCounter value={5000} suffix="+" />
              <p className="mt-2 text-sm text-slate-300">Happy Customers</p>
            </div>
            <div>
              <AnimatedCounter value={1200} suffix="+" />
              <p className="mt-2 text-sm text-slate-300">Sales Completed</p>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12" aria-labelledby="newsletter-heading">
          <h2 id="newsletter-heading" className="text-2xl font-extrabold text-slate-900">Stay in the loop</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            Get new listings and market updates for your selected country delivered to your inbox.
          </p>
          {subscribed ? (
            <p className="mx-auto mt-6 max-w-md rounded-full bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              Thanks for subscribing! You&apos;re on the list.
            </p>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-full border border-slate-300 px-5 py-3 text-sm outline-none focus:border-slate-500"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                Subscribe
              </button>
            </form>
          )}
        </section>
      </section>
    </main>
  );
}

export default Home;
