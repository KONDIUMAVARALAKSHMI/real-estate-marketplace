import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaMapMarkerAlt } from 'react-icons/fa';
import api from '../services/api.js';
import Map from '../components/Map.jsx';
import { geocodeAddress, reverseGeocode } from '../utils/geocode.js';

function UpdateListing() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    country: '',
    state: '',
    city: '',
    latitude: null,
    longitude: null,
    price: 0,
    discountPrice: 0,
    bedrooms: 1,
    bathrooms: 1,
    furnished: false,
    parking: false,
    type: 'rent',
    offer: false,
    imageUrls: [],
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState(null);

  const handleLocateAddress = async () => {
    setLocateError(null);
    setLocating(true);
    try {
      const location = await geocodeAddress(formData.address);
      setFormData((prev) => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        country: location.country || prev.country,
        state: location.state || prev.state,
        city: location.city || prev.city,
      }));
    } catch (err) {
      setLocateError(err.message || 'Could not locate that address.');
    } finally {
      setLocating(false);
    }
  };

  const handleMarkerDragEnd = async (lat, lng) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    try {
      const location = await reverseGeocode(lat, lng);
      setFormData((prev) => ({
        ...prev,
        country: location.country || prev.country,
        state: location.state || prev.state,
        city: location.city || prev.city,
      }));
    } catch {
      // Non-critical — keep the coordinates even if reverse geocoding fails.
    }
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listing/get/${id}`);
        if (res.data.success) {
          const listing = res.data.data;
          // Simple verification
          if (user && listing.userRef !== user._id) {
            setError('You do not have permission to edit this listing.');
            setFetching(false);
            return;
          }
          setFormData(listing);
        }
        setFetching(false);
      } catch (err) {
        console.error('Failed to fetch listing details', err);
        setError('Failed to fetch listing data.');
        setFetching(false);
      }
    };

    fetchListing();
  }, [id, user]);

  const handleChange = (e) => {
    const { id, name, value, type, checked } = e.target;
    if (name === 'type') {
      setFormData((prev) => ({ ...prev, type: value }));
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [id]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, imageUrlInput.trim()],
    }));
    setImageUrlInput('');
  };

  const handleRemoveImageUrl = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.imageUrls.length === 0) {
      setError('Please add at least one image URL.');
      return;
    }

    if (formData.latitude == null || formData.longitude == null) {
      setError('Please click "Re-locate" next to the address to pin the property on the map.');
      return;
    }

    if (formData.offer && Number(formData.discountPrice) >= Number(formData.price)) {
      setError('Discount price must be lower than regular price.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.put(`/listing/update/${id}`, formData);
      setLoading(false);
      if (res.data.success) {
        navigate(`/listing/${res.data.data._id}`);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EBFADC] dark:bg-[#102F15]">
        <div className="text-lg font-semibold text-[#728C5A] animate-pulse">Loading property details...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-24 sm:px-6 lg:px-8 bg-[#EBFADC] dark:bg-[#102F15] transition-colors duration-500 pt-16">
      <div className="mx-auto max-w-5xl rounded-3xl border p-8 sm:p-12 shadow-xl bg-white dark:bg-[#102F15] border-[#728C5A]/20 dark:border-white/10 transition-colors">
        <h1 className="text-4xl text-center mb-10 text-[#102F15] dark:text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
          Update Listing
        </h1>

        {error && (!formData.userRef || (user && formData.userRef !== user._id)) ? (
          <div className="text-center py-8">
            <p className="font-semibold mb-6 p-4 rounded-xl inline-block bg-red-100 text-red-700">{error}</p>
            <br />
            <button
              onClick={() => navigate('/profile')}
              className="rounded-full px-8 py-3.5 text-white font-bold transition bg-[#728C5A] hover:bg-[#61784c] shadow-md"
            >
              Back to Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-12 md:grid-cols-2">
            {/* Left Column - Core Info */}
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#102F15] dark:text-white" htmlFor="title">
                  Property Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl px-4 py-3 outline-none transition text-sm bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/20 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                  placeholder="Luxury Penthouse in Downtown"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#102F15] dark:text-white" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full rounded-xl px-4 py-3 outline-none transition text-sm bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/20 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#102F15] dark:text-white" htmlFor="address">
                  Full Address
                </label>
                <div className="flex gap-2">
                  <input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="flex-1 rounded-xl px-4 py-3 outline-none transition text-sm bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/20 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                    placeholder="123 Luxury Ave, Beverly Hills, CA"
                  />
                  <button
                    type="button"
                    onClick={handleLocateAddress}
                    disabled={locating || !formData.address.trim()}
                    className="flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition bg-[#728C5A] hover:bg-[#61784c] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <FaMapMarkerAlt />
                    {locating ? 'Locating...' : 'Re-locate'}
                  </button>
                </div>
                {locateError && <p className="mt-2 text-xs font-semibold text-red-500">{locateError}</p>}

                {formData.latitude != null && formData.longitude != null && (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Drag the pin to fine-tune the exact location.
                    </p>
                    <div className="rounded-xl overflow-hidden border border-[#728C5A]/20 dark:border-white/10">
                      <Map
                        latitude={formData.latitude}
                        longitude={formData.longitude}
                        title={formData.title || 'Property location'}
                        onMarkerDragEnd={handleMarkerDragEnd}
                      />
                    </div>
                    <p className="text-xs font-semibold text-[#728C5A] dark:text-gray-300">
                      {formData.city && `${formData.city}, `}
                      {formData.state && `${formData.state}, `}
                      {formData.country} &middot; {Number(formData.latitude).toFixed(4)}, {Number(formData.longitude).toFixed(4)}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#102F15] dark:text-white" htmlFor="bedrooms">
                    Bedrooms
                  </label>
                  <input
                    id="bedrooms"
                    type="number"
                    min="1"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl px-4 py-3 outline-none transition text-sm bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/20 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#102F15] dark:text-white" htmlFor="bathrooms">
                    Bathrooms
                  </label>
                  <input
                    id="bathrooms"
                    type="number"
                    min="1"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl px-4 py-3 outline-none transition text-sm bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/20 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#102F15] dark:text-white" htmlFor="price">
                    Regular Price
                  </label>
                  <input
                    id="price"
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl px-4 py-3 outline-none transition text-sm bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/20 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                  />
                </div>
                {formData.offer && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#102F15] dark:text-white" htmlFor="discountPrice">
                      Discount Price
                    </label>
                    <input
                      id="discountPrice"
                      type="number"
                      min="0"
                      value={formData.discountPrice}
                      onChange={handleChange}
                      required={formData.offer}
                      className="w-full rounded-xl px-4 py-3 outline-none transition text-sm bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/20 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Status & Media */}
            <div className="space-y-8">
              <div className="space-y-4 rounded-2xl border p-6 bg-[#EBFADC]/20 dark:bg-black/20 border-[#728C5A]/10 dark:border-white/10 transition-colors">
                <span className="text-sm font-semibold block uppercase tracking-widest text-[#728C5A] dark:text-gray-400">Property Options</span>
                
                <div className="flex gap-6 pb-2">
                  <label className="flex items-center gap-2 font-bold cursor-pointer text-[#102F15] dark:text-white">
                    <input
                      type="radio"
                      name="type"
                      id="type-rent"
                      value="rent"
                      checked={formData.type === 'rent'}
                      onChange={handleChange}
                      className="h-4 w-4 accent-[#728C5A]"
                    />
                    For Rent
                  </label>
                  <label className="flex items-center gap-2 font-bold cursor-pointer text-[#102F15] dark:text-white">
                    <input
                      type="radio"
                      name="type"
                      id="type-sale"
                      value="sale"
                      checked={formData.type === 'sale'}
                      onChange={handleChange}
                      className="h-4 w-4 accent-[#728C5A]"
                    />
                    For Sale
                  </label>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-[#728C5A]/20 dark:border-white/10">
                  <label className="flex items-center gap-3 text-sm font-bold cursor-pointer text-[#102F15] dark:text-white">
                    <input
                      id="parking"
                      type="checkbox"
                      checked={formData.parking}
                      onChange={handleChange}
                      className="h-4 w-4 rounded accent-[#728C5A]"
                    />
                    Includes Parking
                  </label>
                  <label className="flex items-center gap-3 text-sm font-bold cursor-pointer text-[#102F15] dark:text-white">
                    <input
                      id="furnished"
                      type="checkbox"
                      checked={formData.furnished}
                      onChange={handleChange}
                      className="h-4 w-4 rounded accent-[#728C5A]"
                    />
                    Fully Furnished
                  </label>
                  <label className="flex items-center gap-3 text-sm font-bold cursor-pointer text-[#102F15] dark:text-white">
                    <input
                      id="offer"
                      type="checkbox"
                      checked={formData.offer}
                      onChange={handleChange}
                      className="h-4 w-4 rounded accent-[#728C5A]"
                    />
                    Special Offer Pricing
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#102F15] dark:text-white">
                  Gallery Image URLs (At least 1 required)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://example.com/luxury-pool.jpg"
                    className="flex-1 rounded-xl px-4 py-3 outline-none transition text-sm bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/20 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="rounded-xl px-6 py-3 font-bold transition border border-[#728C5A]/30 text-[#728C5A] hover:bg-[#728C5A] hover:text-white bg-white dark:bg-[#102F15]"
                  >
                    Add
                  </button>
                </div>

                {formData.imageUrls.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-56 overflow-y-auto rounded-xl p-3 border bg-gray-50 dark:bg-black/20 border-[#728C5A]/20 dark:border-white/10">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between gap-3 rounded-lg p-3 text-sm border bg-white dark:bg-[#102F15] border-[#728C5A]/10 dark:border-white/10 shadow-sm">
                        <span className="truncate flex-1 font-medium text-gray-500 dark:text-gray-400">{url}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(index)}
                          className="font-bold transition text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="text-sm font-semibold p-3 rounded-lg bg-red-100 text-red-700">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-4 text-lg font-bold text-white shadow-xl transition bg-[#728C5A] hover:bg-[#61784c] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving Changes...' : 'Save Updates'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export default UpdateListing;
