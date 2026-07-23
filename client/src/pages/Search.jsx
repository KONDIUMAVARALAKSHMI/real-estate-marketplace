import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaFilter, FaTimes, FaGlobe, FaSearchLocation } from 'react-icons/fa';
import ListingCard from '../components/ListingCard.jsx';
import api from '../services/api.js';
import { setCountry, countryCurrencyMap } from '../redux/features/marketplace/marketplaceSlice.js';

function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { selectedCountry } = useSelector((state) => state.marketplace);

  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
    country: selectedCountry || 'All Countries',
    city: '',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const typeFromUrl = urlParams.get('type');
    const parkingFromUrl = urlParams.get('parking');
    const furnishedFromUrl = urlParams.get('furnished');
    const offerFromUrl = urlParams.get('offer');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');
    const countryFromUrl = urlParams.get('country');
    const cityFromUrl = urlParams.get('city');

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl ||
      countryFromUrl ||
      cityFromUrl
    ) {
      setSidebarData({
        searchTerm: searchTermFromUrl || '',
        type: typeFromUrl || 'all',
        parking: parkingFromUrl === 'true',
        furnished: furnishedFromUrl === 'true',
        offer: offerFromUrl === 'true',
        sort: sortFromUrl || 'created_at',
        order: orderFromUrl || 'desc',
        country: countryFromUrl || 'All Countries',
        city: cityFromUrl || '',
      });
    }

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      try {
        const res = await api.get(`/listing/get?${searchQuery}`);
        setListings(res.data.data);
        if (res.data.data.length > 8) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
      } catch (err) {
        console.error('Failed to fetch listings', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);

  // Sync selectedCountry in Redux when sidebarData.country changes
  useEffect(() => {
    if (sidebarData.country && sidebarData.country !== selectedCountry) {
      dispatch(setCountry(sidebarData.country));
    }
  }, [sidebarData.country, selectedCountry, dispatch]);

  const handleChange = (e) => {
    if (
      e.target.id === 'all' ||
      e.target.id === 'rent' ||
      e.target.id === 'sale'
    ) {
      setSidebarData({ ...sidebarData, type: e.target.id });
    }

    if (e.target.id === 'searchTerm' || e.target.id === 'city') {
      setSidebarData({ ...sidebarData, [e.target.id]: e.target.value });
    }

    if (e.target.id === 'country') {
      setSidebarData({ ...sidebarData, country: e.target.value });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setSidebarData({
        ...sidebarData,
        [e.target.id]:
          e.target.checked || e.target.checked === 'true',
      });
    }

    if (e.target.id === 'sort_order') {
      const sort = e.target.value.split('_')[0] || 'created_at';
      const order = e.target.value.split('_')[1] || 'desc';
      setSidebarData({ ...sidebarData, sort, order });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set('searchTerm', sidebarData.searchTerm);
    urlParams.set('type', sidebarData.type);
    urlParams.set('parking', sidebarData.parking);
    urlParams.set('furnished', sidebarData.furnished);
    urlParams.set('offer', sidebarData.offer);
    urlParams.set('sort', sidebarData.sort);
    urlParams.set('order', sidebarData.order);
    
    if (sidebarData.country !== 'All Countries') {
      urlParams.set('country', sidebarData.country);
    }
    if (sidebarData.city) {
      urlParams.set('city', sidebarData.city);
    }

    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
    setIsMobileFiltersOpen(false); // Close mobile drawer on submit
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const startIndex = numberOfListings;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();

    try {
      const res = await api.get(`/listing/get?${searchQuery}`);
      if (res.data.data.length < 9) {
        setShowMore(false);
      }
      setListings([...listings, ...res.data.data]);
    } catch (err) {
      console.error('Failed to fetch more listings', err);
    }
  };

  const handleClearFilters = () => {
    const defaultData = {
      searchTerm: '',
      type: 'all',
      parking: false,
      furnished: false,
      offer: false,
      sort: 'created_at',
      order: 'desc',
      country: 'All Countries',
      city: '',
    };
    setSidebarData(defaultData);
    navigate('/search');
    setIsMobileFiltersOpen(false);
  };

  const allCountries = ['All Countries', ...Object.keys(countryCurrencyMap)];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#EBFADC] dark:bg-[#102F15] transition-colors duration-500 pt-16">
      
      {/* Mobile Filter Toggle */}
      <div className="md:hidden border-b p-4 flex justify-between items-center bg-white dark:bg-[#102F15] border-[#728C5A]/20 dark:border-white/10 sticky top-16 z-30">
        <h1 className="text-xl font-bold text-[#102F15] dark:text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Properties</h1>
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm bg-[#728C5A] hover:bg-[#61784c]"
        >
          <FaFilter /> Filters
        </button>
      </div>

      {/* Sidebar Filters */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-full md:w-80 md:static md:block md:min-h-screen md:shrink-0 transform transition-transform duration-300 ease-in-out bg-white dark:bg-[#102F15]/90 border-r border-[#728C5A]/10 dark:border-white/10 pt-16 md:pt-0`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header (Mobile) */}
          <div className="md:hidden flex items-center justify-between border-b p-4 border-[#728C5A]/20 dark:border-white/10">
            <h2 className="text-lg font-bold text-[#102F15] dark:text-white">Filters</h2>
            <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-[#728C5A] dark:text-gray-300">
              <FaTimes className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Search Term */}
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider block text-[#102F15] dark:text-white">
                Search Keyword
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="searchTerm"
                  placeholder="Beach house, modern..."
                  value={sidebarData.searchTerm}
                  onChange={handleChange}
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/30 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                />
                <FaSearchLocation className="absolute left-3.5 top-3.5 text-sm text-[#728C5A] dark:text-gray-400" />
              </div>
            </div>

            {/* Location (Country & City) */}
            <div className="space-y-4 pt-6 border-t border-[#728C5A]/20 dark:border-white/10">
              <label className="text-sm font-semibold uppercase tracking-wider block text-[#102F15] dark:text-white">
                Location
              </label>
              
              <div className="space-y-3">
                <div className="relative">
                  <select
                    id="country"
                    value={sidebarData.country}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium outline-none transition bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/30 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                  >
                    {allCountries.map((c) => (
                      <option key={c} value={c} className="text-gray-900">{c}</option>
                    ))}
                  </select>
                  <FaGlobe className="absolute left-3.5 top-3.5 text-sm text-[#728C5A] dark:text-gray-400" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#728C5A] dark:text-gray-400">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>

                <input
                  type="text"
                  id="city"
                  placeholder="City (e.g. New York)"
                  value={sidebarData.city}
                  onChange={handleChange}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/30 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                />
              </div>
            </div>

            {/* Property Type */}
            <div className="space-y-3 pt-6 border-t border-[#728C5A]/20 dark:border-white/10">
              <label className="text-sm font-semibold uppercase tracking-wider block text-[#102F15] dark:text-white">
                Listing Type
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 font-medium text-[#102F15] dark:text-white">
                  <input
                    type="radio"
                    id="all"
                    name="type"
                    checked={sidebarData.type === 'all'}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#728C5A]"
                  />
                  <span>All Properties</span>
                </label>
                <label className="flex items-center gap-3 font-medium text-[#102F15] dark:text-white">
                  <input
                    type="radio"
                    id="rent"
                    name="type"
                    checked={sidebarData.type === 'rent'}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#728C5A]"
                  />
                  <span>For Rent</span>
                </label>
                <label className="flex items-center gap-3 font-medium text-[#102F15] dark:text-white">
                  <input
                    type="radio"
                    id="sale"
                    name="type"
                    checked={sidebarData.type === 'sale'}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#728C5A]"
                  />
                  <span>For Sale</span>
                </label>
              </div>
            </div>

            {/* Amenities & Offers */}
            <div className="space-y-3 pt-6 border-t border-[#728C5A]/20 dark:border-white/10">
              <label className="text-sm font-semibold uppercase tracking-wider block text-[#102F15] dark:text-white">
                Features
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 font-medium text-[#102F15] dark:text-white">
                  <input
                    type="checkbox"
                    id="parking"
                    checked={sidebarData.parking}
                    onChange={handleChange}
                    className="h-4 w-4 rounded accent-[#728C5A]"
                  />
                  <span>Parking Available</span>
                </label>
                <label className="flex items-center gap-3 font-medium text-[#102F15] dark:text-white">
                  <input
                    type="checkbox"
                    id="furnished"
                    checked={sidebarData.furnished}
                    onChange={handleChange}
                    className="h-4 w-4 rounded accent-[#728C5A]"
                  />
                  <span>Furnished</span>
                </label>
                <label className="flex items-center gap-3 font-medium text-[#102F15] dark:text-white">
                  <input
                    type="checkbox"
                    id="offer"
                    checked={sidebarData.offer}
                    onChange={handleChange}
                    className="h-4 w-4 rounded accent-[#728C5A]"
                  />
                  <span>Special Offers Only</span>
                </label>
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-3 pt-6 border-t border-[#728C5A]/20 dark:border-white/10">
              <label className="text-sm font-semibold uppercase tracking-wider block text-[#102F15] dark:text-white">
                Sort By
              </label>
              <div className="relative">
                <select
                  id="sort_order"
                  onChange={handleChange}
                  value={`${sidebarData.sort}_${sidebarData.order}`}
                  className="w-full appearance-none rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/30 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                >
                  <option value="created_at_desc" className="text-gray-900">Newest First</option>
                  <option value="created_at_asc" className="text-gray-900">Oldest First</option>
                  <option value="price_desc" className="text-gray-900">Price: High to Low</option>
                  <option value="price_asc" className="text-gray-900">Price: Low to High</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#728C5A] dark:text-gray-400">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="pt-8 pb-10 md:pb-0 space-y-3">
              <button
                type="submit"
                className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-md bg-[#728C5A] hover:bg-[#61784c] transition"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full rounded-xl py-3 text-sm font-semibold transition bg-transparent text-[#728C5A] hover:text-[#61784c] dark:text-gray-300 dark:hover:text-white"
              >
                Clear All
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content (Results) */}
      <div className="flex-1 p-6 sm:p-10">
        <div className="mb-8 flex flex-col gap-2">
          <h1
            className="text-4xl text-[#102F15] dark:text-white"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontWeight: 700 }}
          >
            Property Results
          </h1>
          <p className="text-sm font-medium text-[#728C5A] dark:text-gray-300">
            {!loading && (
              <>Showing {listings.length} properties {sidebarData.country !== 'All Countries' && `in ${sidebarData.country}`}</>
            )}
          </p>
        </div>

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border bg-white dark:bg-[#102F15]/50 p-4 border-[#728C5A]/20 dark:border-white/10">
                <div className="h-56 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-black/20" />
                <div className="mt-4 h-6 w-3/4 animate-pulse rounded-md bg-gray-200 dark:bg-black/20" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded-md bg-gray-200 dark:bg-black/20" />
                <div className="mt-6 flex gap-2">
                  <div className="h-4 w-1/4 animate-pulse rounded-md bg-gray-200 dark:bg-black/20" />
                  <div className="h-4 w-1/4 animate-pulse rounded-md bg-gray-200 dark:bg-black/20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-dashed p-10 text-center bg-white dark:bg-[#102F15]/30 border-[#728C5A]/30 dark:border-white/20">
            <FaSearchLocation className="mb-4 text-5xl text-[#728C5A]/60" />
            <h2 className="text-2xl font-bold mb-2 text-[#102F15] dark:text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              No properties found
            </h2>
            <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
              We couldn't find any listings matching your current filters. Try adjusting your search criteria or clearing filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-6 rounded-full px-6 py-2.5 text-sm font-semibold transition border-2 border-[#728C5A]/30 text-[#102F15] dark:text-white hover:bg-[#728C5A]/10"
            >
              Clear Filters
            </button>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}

        {showMore && (
          <div className="mt-12 text-center">
            <button
              onClick={onShowMoreClick}
              className="rounded-full border-2 px-8 py-3 text-sm font-semibold transition border-[#728C5A] text-[#728C5A] hover:bg-[#728C5A] hover:text-white"
            >
              Load More Properties
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
