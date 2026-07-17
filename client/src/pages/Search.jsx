import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import api from '../services/api.js';
import ListingCard from '../components/ListingCard.jsx';
import { countryList, setCountry } from '../redux/features/marketplace/marketplaceSlice.js';

const DEFAULT_FILTERS = {
  searchTerm: '',
  type: 'all',
  tier: 'all',
  parking: false,
  furnished: false,
  offer: false,
  minPrice: '',
  maxPrice: '',
  minBedrooms: '',
  minBathrooms: '',
  sort: 'createdAt',
  order: 'desc',
};

function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { selectedCountry } = useSelector((state) => state.marketplace);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [country, setCountryFilter] = useState(selectedCountry);
  const [city, setCityFilter] = useState('all');
  const [cityOptions, setCityOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [showMore, setShowMore] = useState(false);

  // Read filters (including country/city) from the URL whenever it changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);

    const urlCountry = urlParams.get('country');
    const effectiveCountry = urlCountry !== null ? urlCountry : selectedCountry;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountryFilter(effectiveCountry);

    // Keep the global country selector in sync when a specific (non-"all") country
    // arrives via a link (e.g. a Popular City card), so currency/nav stay unified.
    if (effectiveCountry !== 'all' && effectiveCountry !== selectedCountry && countryList.includes(effectiveCountry)) {
      dispatch(setCountry(effectiveCountry));
    }

    setCityFilter(urlParams.get('city') || 'all');

    setFilters({
      searchTerm: urlParams.get('searchTerm') || '',
      type: urlParams.get('type') || 'all',
      tier: urlParams.get('tier') || 'all',
      parking: urlParams.get('parking') === 'true',
      furnished: urlParams.get('furnished') === 'true',
      offer: urlParams.get('offer') === 'true',
      minPrice: urlParams.get('minPrice') || '',
      maxPrice: urlParams.get('maxPrice') || '',
      minBedrooms: urlParams.get('minBedrooms') || '',
      minBathrooms: urlParams.get('minBathrooms') || '',
      sort: urlParams.get('sort') || 'createdAt',
      order: urlParams.get('order') || 'desc',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Fetch results whenever the URL (source of truth) changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (!urlParams.has('country')) {
      urlParams.set('country', selectedCountry);
    }

    const fetchListings = async () => {
      try {
        setLoading(true);
        setShowMore(false);
        const res = await api.get(`/listing/get?${urlParams.toString()}`);
        if (res.data.success) {
          setListings(res.data.data);
          setTotalCount(res.data.data.length);
          if (res.data.data.length === 12) {
            setShowMore(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch search results', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search, selectedCountry]);

  // Populate the city dropdown for whichever country is currently filtered
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const countryParam = country && country !== 'all' ? `country=${encodeURIComponent(country)}&` : '';
        const res = await api.get(`/listing/cities?${countryParam}limit=30`);
        if (res.data.success) setCityOptions(res.data.data);
      } catch (err) {
        console.error('Failed to fetch city options', err);
      }
    };
    fetchCities();
  }, [country]);

  const handleChange = (e) => {
    const { id, name, value, checked, type } = e.target;

    if (name === 'type') {
      setFilters((prev) => ({ ...prev, type: value }));
    } else if (type === 'checkbox') {
      setFilters((prev) => ({ ...prev, [id]: checked }));
    } else if (id === 'sort_order') {
      const [sort, order] = value.split('_');
      setFilters((prev) => ({ ...prev, sort: sort || 'createdAt', order: order || 'desc' }));
    } else {
      setFilters((prev) => ({ ...prev, [id]: value }));
    }
  };

  const buildUrlParams = useCallback(() => {
    const urlParams = new URLSearchParams();
    if (filters.searchTerm) urlParams.set('searchTerm', filters.searchTerm);
    urlParams.set('type', filters.type);
    if (filters.tier !== 'all') urlParams.set('tier', filters.tier);
    if (filters.parking) urlParams.set('parking', 'true');
    if (filters.furnished) urlParams.set('furnished', 'true');
    if (filters.offer) urlParams.set('offer', 'true');
    if (filters.minPrice) urlParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) urlParams.set('maxPrice', filters.maxPrice);
    if (filters.minBedrooms) urlParams.set('minBedrooms', filters.minBedrooms);
    if (filters.minBathrooms) urlParams.set('minBathrooms', filters.minBathrooms);
    urlParams.set('sort', filters.sort);
    urlParams.set('order', filters.order);
    urlParams.set('country', country);
    if (city !== 'all') urlParams.set('city', city);
    return urlParams;
  }, [filters, country, city]);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?${buildUrlParams().toString()}`);
  };

  const handleClearFilters = () => {
    navigate(`/search?country=${encodeURIComponent(selectedCountry)}`);
  };

  const handleShowMore = async () => {
    const urlParams = buildUrlParams();
    urlParams.set('startIndex', listings.length);
    try {
      const res = await api.get(`/listing/get?${urlParams.toString()}`);
      if (res.data.success) {
        setListings((prev) => [...prev, ...res.data.data]);
        setTotalCount((prev) => prev + res.data.data.length);
        setShowMore(res.data.data.length >= 12);
      }
    } catch (err) {
      console.error('Failed to load more results', err);
    }
  };

  const activeFilterCount = [
    filters.searchTerm, filters.type !== 'all', filters.tier !== 'all', filters.parking, filters.furnished,
    filters.offer, filters.minPrice, filters.maxPrice, filters.minBedrooms, filters.minBathrooms,
    city !== 'all',
  ].filter(Boolean).length;

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      {/* Sidebar Filters */}
      <aside className="w-full shrink-0 border-r border-slate-200 bg-white p-8 md:min-h-screen md:w-80">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Filters</h2>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600"
              >
                <FaTimes aria-hidden="true" /> Clear Filters
              </button>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="searchTerm">
              Search Text
            </label>
            <input
              id="searchTerm"
              type="text"
              value={filters.searchTerm}
              onChange={handleChange}
              placeholder="e.g. villa, Tokyo, condo"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="country-filter">
              Country
            </label>
            <select
              id="country-filter"
              value={country}
              onChange={(e) => { setCountryFilter(e.target.value); setCityFilter('all'); }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-500"
            >
              <option value="all">All Countries</option>
              {countryList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="city-filter">
              City
            </label>
            <select
              id="city-filter"
              value={city}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-500"
            >
              <option value="all">All Cities</option>
              {cityOptions.map((c) => (
                <option key={`${c.city}-${c.country}`} value={c.city}>{c.city} ({c.count})</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <span className="block text-sm font-semibold text-slate-700">Type</span>
            <div className="flex flex-col gap-2">
              {[
                { value: 'all', label: 'Rent & Sale' },
                { value: 'rent', label: 'Rent Only' },
                { value: 'sale', label: 'Sale Only' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="radio"
                    name="type"
                    value={opt.value}
                    checked={filters.type === opt.value}
                    onChange={handleChange}
                    className="h-4 w-4 accent-slate-800"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="tier">
              Property Tier
            </label>
            <select
              id="tier"
              value={filters.tier}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-500"
            >
              <option value="all">All Tiers</option>
              <option value="affordable">Affordable</option>
              <option value="mid">Mid-range</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          <div className="space-y-3">
            <span className="block text-sm font-semibold text-slate-700">Price Range (USD)</span>
            <div className="flex items-center gap-2">
              <input
                id="minPrice"
                type="number"
                min="0"
                placeholder="Min"
                value={filters.minPrice}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
              />
              <span className="text-slate-400">–</span>
              <input
                id="maxPrice"
                type="number"
                min="0"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="minBedrooms">
                Bedrooms
              </label>
              <select
                id="minBedrooms"
                value={filters.minBedrooms}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="minBathrooms">
                Bathrooms
              </label>
              <select
                id="minBathrooms"
                value={filters.minBathrooms}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <span className="block text-sm font-semibold text-slate-700">Amenities & Offers</span>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input id="parking" type="checkbox" checked={filters.parking} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 accent-slate-800" />
                Parking Spot
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input id="furnished" type="checkbox" checked={filters.furnished} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 accent-slate-800" />
                Furnished
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input id="offer" type="checkbox" checked={filters.offer} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 accent-slate-800" />
                Special Offer
              </label>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="sort_order">
              Sort By
            </label>
            <select
              id="sort_order"
              onChange={handleChange}
              value={`${filters.sort}_${filters.order}`}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-500"
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_desc">Recently Added</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="createdAt_desc">Most Popular</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Apply Filters
          </button>
        </form>
      </aside>

      {/* Search Results */}
      <section className="flex-1 p-8">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-extrabold text-slate-900">Listing Results</h1>
          {!loading && (
            <p className="text-sm font-semibold text-slate-500">
              Showing {totalCount} Propert{totalCount === 1 ? 'y' : 'ies'}
            </p>
          )}
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="animate-pulse overflow-hidden rounded-3xl border border-slate-100 bg-white">
                <div className="h-56 w-full bg-slate-200" />
                <div className="space-y-3 p-6">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-200" />
                  <div className="h-3 w-full rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <p className="text-lg font-semibold text-slate-700">
              No properties available in this country yet.
            </p>
            <p className="max-w-md text-sm text-slate-500">
              Try clearing your filters or choosing a different country or city.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:text-slate-900"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>

            {showMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleShowMore}
                  className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:text-slate-900"
                >
                  Show More
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default Search;
