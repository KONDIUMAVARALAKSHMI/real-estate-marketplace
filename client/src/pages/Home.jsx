import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaArrowRight,
  FaShieldAlt,
  FaHandshake,
  FaGlobe,
  FaSearch,
  FaHeadset,
} from 'react-icons/fa';
import api from '../services/api.js';
import ListingCard from '../components/ListingCard.jsx';
import { getPropertyStats } from '../utils/stats.js';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({ title, viewAllLink }) {
  return (
    <div className="mb-7 flex items-center justify-between">
      <h2
        className="text-2xl font-bold text-[#102F15] dark:text-white"
        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
      >
        {title}
      </h2>
      {viewAllLink && (
        <Link
          to={viewAllLink}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#728C5A] hover:text-[#61784c] transition-colors"
        >
          View all <FaArrowRight className="text-xs" />
        </Link>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border p-4 bg-white dark:bg-[#102F15]/60 border-[#728C5A]/10 dark:border-white/5">
      <div className="h-48 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-white/10" />
      <div className="mt-4 h-5 w-3/4 animate-pulse rounded-md bg-gray-200 dark:bg-white/10" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded-md bg-gray-200 dark:bg-white/10" />
      <div className="mt-5 flex gap-3">
        <div className="h-4 w-1/4 animate-pulse rounded-md bg-gray-200 dark:bg-white/10" />
        <div className="h-4 w-1/4 animate-pulse rounded-md bg-gray-200 dark:bg-white/10" />
      </div>
    </div>
  );
}

const POPULAR_CITIES = [
  { name: 'New York', country: 'United States', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80', properties: 1250 },
  { name: 'London', country: 'United Kingdom', image: 'https://images.unsplash.com/photo-1513635269975-5969336cd182?auto=format&fit=crop&w=800&q=80', properties: 980 },
  { name: 'Dubai', country: 'United Arab Emirates', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80', properties: 1540 },
  { name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80', properties: 860 },
  { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e90760b3838?auto=format&fit=crop&w=800&q=80', properties: 720 },
  { name: 'Sydney', country: 'Australia', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80', properties: 650 },
];

const TRUST_ITEMS = [
  {
    icon: FaShieldAlt,
    title: 'Trusted Listings',
    desc: 'Verified properties from trusted sellers.',
  },
  {
    icon: FaGlobe,
    title: 'Worldwide',
    desc: 'Find properties in top locations worldwide.',
  },
  {
    icon: FaHeadset,
    title: '24/7 Support',
    desc: "We're here to help you anytime, anywhere.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

function Home() {
  const navigate = useNavigate();
  const { selectedCountry } = useSelector((state) => state.marketplace);
  // eslint-disable-next-line no-unused-vars
  const stats = getPropertyStats(selectedCountry);

  const [offerListings, setOfferListings]   = useState([]);
  const [rentListings, setRentListings]     = useState([]);
  const [saleListings, setSaleListings]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [searchTerm, setSearchTerm]         = useState('');
  const [type, setType]                     = useState('all');
  const [propertyType, setPropertyType]     = useState('all');
  const [minPrice, setMinPrice]             = useState('');
  const [maxPrice, setMaxPrice]             = useState('');

  /* ── Search submission ─────────────────────────────────────── */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm)                           params.set('searchTerm', searchTerm);
    if (type !== 'all')                       params.set('type', type);
    if (propertyType !== 'all')               params.set('propertyType', propertyType);
    if (minPrice)                             params.set('minPrice', minPrice);
    if (maxPrice)                             params.set('maxPrice', maxPrice);
    if (selectedCountry !== 'All Countries')  params.set('country', selectedCountry);
    navigate(`/search?${params.toString()}`);
  };

  /* ── Data fetch ────────────────────────────────────────────── */
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ limit: 4 });
        if (selectedCountry !== 'All Countries') params.append('country', selectedCountry);

        const [offerRes, rentRes, saleRes] = await Promise.all([
          api.get(`/listing/get?offer=true&${params.toString()}`),
          api.get(`/listing/get?type=rent&${params.toString()}`),
          api.get(`/listing/get?type=sale&${params.toString()}`),
        ]);

        setOfferListings(offerRes.data.data);
        setRentListings(rentRes.data.data);
        setSaleListings(saleRes.data.data);
      } catch (err) {
        console.error('Error fetching home listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, [selectedCountry]);

  const countryQS =
    selectedCountry !== 'All Countries'
      ? `&country=${encodeURIComponent(selectedCountry)}`
      : '';

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <main className="flex flex-col bg-[#EBFADC] dark:bg-[#102F15] transition-colors duration-500">

      {/* ═══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col justify-between pt-20">

        {/* Split row: LEFT text · RIGHT image */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 flex-1">

          {/* ── LEFT: Headline + subtext ──────────────────────── */}
          <div className="w-full lg:w-[54%] lg:pr-14 xl:pr-20">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#728C5A]">
              Premium Real Estate
            </p>

            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              <span className="block text-[#102F15] dark:text-white">
                Find Your Perfect
              </span>
              <span className="block text-[#728C5A]">Property</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#102F15]/60 dark:text-white/55 max-w-[380px]">
              Discover the best places to live, rent, or invest around the world.
            </p>

            {/* Quick-action links (secondary, unobtrusive) */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={`/search?type=sale${countryQS}`}
                className="inline-flex items-center gap-2 rounded-full border border-[#728C5A]/40 px-5 py-2.5 text-sm font-semibold text-[#728C5A] hover:bg-[#728C5A] hover:text-white hover:border-[#728C5A] transition-all duration-200"
              >
                For Sale
              </Link>
              <Link
                to={`/search?type=rent${countryQS}`}
                className="inline-flex items-center gap-2 rounded-full border border-[#728C5A]/40 px-5 py-2.5 text-sm font-semibold text-[#728C5A] hover:bg-[#728C5A] hover:text-white hover:border-[#728C5A] transition-all duration-200"
              >
                For Rent
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Villa image ────────────────────────────── */}
          <div className="w-full lg:w-[46%] relative">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
                alt="Luxury Forest Villa"
                className="w-full h-64 sm:h-80 lg:h-[420px] object-cover transition-transform duration-700 hover:scale-105"
              />
              {/* Subtle left-edge gradient that blends image into page bg */}
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#EBFADC] dark:from-[#102F15] to-transparent pointer-events-none" />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 left-4 sm:left-8 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-sm bg-white/90 dark:bg-[#102F15]/90 border border-[#728C5A]/20 dark:border-white/10">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active Listings</p>
              <p className="text-xl font-black text-[#728C5A]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                {stats.totalProperties.toLocaleString()}+
              </p>
            </div>
          </div>
        </div>

        {/* ── SEARCH BAR ────────────────────────────────────────── */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="rounded-2xl shadow-xl border border-[#728C5A]/10 dark:border-white/5 bg-white dark:bg-[#1a3d20] px-4 py-3">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col md:flex-row items-stretch md:items-center gap-2"
            >

              {/* Location */}
              <div className="relative flex-[2] min-w-0">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by city, state or country"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl py-3 pl-9 pr-4 text-sm outline-none transition bg-gray-50 dark:bg-[#102F15] text-[#102F15] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-200 dark:border-white/5 focus:border-[#728C5A] focus:ring-1 focus:ring-[#728C5A]"
                />
              </div>

              <div className="hidden md:block w-px self-stretch bg-gray-200 dark:bg-white/10 mx-1" />

              {/* Rent / Sale */}
              <div className="flex-1 min-w-[110px]">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl py-3 px-4 text-sm outline-none transition appearance-none cursor-pointer bg-gray-50 dark:bg-[#102F15] text-[#102F15] dark:text-white border border-gray-200 dark:border-white/5 focus:border-[#728C5A]"
                >
                  <option value="all">Rent / Sale</option>
                  <option value="rent">Rent</option>
                  <option value="sale">Sale</option>
                </select>
              </div>

              <div className="hidden md:block w-px self-stretch bg-gray-200 dark:bg-white/10 mx-1" />

              {/* Property Type */}
              <div className="flex-1 min-w-[130px]">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full rounded-xl py-3 px-4 text-sm outline-none transition appearance-none cursor-pointer bg-gray-50 dark:bg-[#102F15] text-[#102F15] dark:text-white border border-gray-200 dark:border-white/5 focus:border-[#728C5A]"
                >
                  <option value="all">Property Type</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="condo">Condo</option>
                </select>
              </div>

              <div className="hidden md:block w-px self-stretch bg-gray-200 dark:bg-white/10 mx-1" />

              {/* Min Price */}
              <div className="flex-1 min-w-[110px]">
                <select
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-xl py-3 px-4 text-sm outline-none transition appearance-none cursor-pointer bg-gray-50 dark:bg-[#102F15] text-[#102F15] dark:text-white border border-gray-200 dark:border-white/5 focus:border-[#728C5A]"
                >
                  <option value="">Min Price</option>
                  <option value="100000">$100k</option>
                  <option value="500000">$500k</option>
                  <option value="1000000">$1M</option>
                  <option value="5000000">$5M</option>
                </select>
              </div>

              <div className="hidden md:block w-px self-stretch bg-gray-200 dark:bg-white/10 mx-1" />

              {/* Max Price */}
              <div className="flex-1 min-w-[110px]">
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-xl py-3 px-4 text-sm outline-none transition appearance-none cursor-pointer bg-gray-50 dark:bg-[#102F15] text-[#102F15] dark:text-white border border-gray-200 dark:border-white/5 focus:border-[#728C5A]"
                >
                  <option value="">Max Price</option>
                  <option value="500000">$500k</option>
                  <option value="1000000">$1M</option>
                  <option value="5000000">$5M</option>
                  <option value="10000000">$10M+</option>
                </select>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="shrink-0 w-full md:w-auto rounded-xl px-8 py-3 text-sm font-bold text-white bg-[#728C5A] hover:bg-[#61784c] active:scale-[0.97] transition-all shadow-md"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MAIN CONTENT SECTIONS
      ═══════════════════════════════════════════════════════════ */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 space-y-20">

        {/* ── Featured / Special Offers ──────────────────────────── */}
        {loading ? (
          <div>
            <SectionHeader title="Featured Properties" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : offerListings.length > 0 && (
          <div>
            <SectionHeader
              title="Featured Properties"
              viewAllLink={`/search?offer=true${countryQS}`}
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {offerListings.map((listing) => (
                <ListingCard listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}

        {/* ── Trust / Stats Bar (matches reference bottom strip) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-10 border-t border-b border-[#728C5A]/15 dark:border-white/5">
          {TRUST_ITEMS.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl border border-[#728C5A]/30 dark:border-[#728C5A]/40 text-[#728C5A]">
                <item.icon className="text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-[#102F15] dark:text-white text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed max-w-[180px]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Global Destinations ───────────────────────────────── */}
        {selectedCountry === 'All Countries' && (
          <div>
            <SectionHeader title="Global Destinations" viewAllLink="/search" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {POPULAR_CITIES.map((city) => (
                <div
                  key={city.name}
                  onClick={() => navigate(`/search?city=${encodeURIComponent(city.name)}`)}
                  className="group relative h-64 cursor-pointer overflow-hidden rounded-3xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <img
                    src={city.image}
                    alt={city.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102F15]/90 via-[#102F15]/30 to-transparent transition-opacity group-hover:opacity-90" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3
                      className="text-2xl font-bold text-white"
                      style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                    >
                      {city.name}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-white/70">{city.country}</p>
                    <div className="mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider bg-[#728C5A] text-white">
                      {city.properties} Properties
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Premium Rentals ───────────────────────────────────── */}
        {loading ? (
          <div>
            <SectionHeader title="Premium Rentals" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : rentListings.length > 0 && (
          <div>
            <SectionHeader
              title="Premium Rentals"
              viewAllLink={`/search?type=rent${countryQS}`}
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {rentListings.map((listing) => (
                <ListingCard listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}

        {/* ── Luxury Estates for Sale ───────────────────────────── */}
        {loading ? (
          <div>
            <SectionHeader title="Luxury Estates for Sale" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : saleListings.length > 0 && (
          <div>
            <SectionHeader
              title="Luxury Estates for Sale"
              viewAllLink={`/search?type=sale${countryQS}`}
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {saleListings.map((listing) => (
                <ListingCard listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}

        {/* ── The EstateHub Advantage ───────────────────────────── */}
        <div className="rounded-3xl p-10 sm:p-14 bg-white dark:bg-[#0a1f0d]/60 border border-[#728C5A]/10 dark:border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2
              className="text-3xl font-bold text-[#102F15] dark:text-white"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              The EstateHub Advantage
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Experience the pinnacle of real estate service with our premium platform
              designed for discerning clients.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: FaShieldAlt,
                title: 'Secure Transactions',
                desc: 'Bank-grade security and verified listings ensure your peace of mind.',
              },
              {
                icon: FaGlobe,
                title: 'Global Portfolio',
                desc: 'Access exclusive properties across ten premium international markets.',
              },
              {
                icon: FaHandshake,
                title: 'Concierge Service',
                desc: 'Direct connection to elite agents and property managers.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-8 text-center border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-[#EBFADC]/40 dark:bg-[#102F15] border-[#728C5A]/15 dark:border-white/10"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#728C5A]/10 dark:bg-[#728C5A]/20 text-[#728C5A]">
                  <feature.icon className="text-xl" />
                </div>
                <h3
                  className="mb-2 text-lg font-bold text-[#102F15] dark:text-white"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Newsletter ────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-[2rem] px-8 py-16 sm:px-12 sm:py-20 text-center bg-[#102F15] dark:bg-[#0a1f0d]">
          {/* Decorative background circles */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-[#728C5A]/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#728C5A]/8" />

          <div className="relative z-10 mx-auto max-w-xl">
            <h2
              className="text-3xl font-bold text-white sm:text-4xl"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Curated Luxury, Delivered.
            </h2>
            <p className="mx-auto mt-4 text-white/65 leading-relaxed">
              Subscribe for exclusive off-market listings and international real
              estate insights.
            </p>
            <form className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full p-2 bg-white/10 border border-white/15">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="w-full bg-transparent px-4 py-2 text-sm outline-none text-white placeholder-white/40"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-[#728C5A] hover:bg-[#61784c] active:scale-[0.97] transition-all"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

      </div>
    </main>
  );
}

export default Home;
