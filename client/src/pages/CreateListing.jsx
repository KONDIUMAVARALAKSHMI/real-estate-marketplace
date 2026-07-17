import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import api from '../services/api.js';
import Map from '../components/Map.jsx';
import { geocodeAddress, reverseGeocode } from '../utils/geocode.js';

function CreateListing() {
  const navigate = useNavigate();
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
      setError('Please click "Locate" next to the address to pin the property on the map.');
      return;
    }

    if (formData.offer && Number(formData.discountPrice) >= Number(formData.price)) {
      setError('Discount price must be lower than regular price.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/listing/create', formData);
      setLoading(false);
      if (res.data.success) {
        navigate(`/listing/${res.data.data._id}`);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-slate-900 text-center mb-8">Create a Listing</h1>

        <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-2">
          {/* Left Column - Core Info */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-slate-500"
                placeholder="Modern Apartment"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-slate-500"
                placeholder="Describe your property..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="address">
                Address
              </label>
              <div className="flex gap-2">
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-slate-500"
                  placeholder="123 Main St, New York, NY"
                />
                <button
                  type="button"
                  onClick={handleLocateAddress}
                  disabled={locating || !formData.address.trim()}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaMapMarkerAlt />
                  {locating ? 'Locating...' : 'Locate'}
                </button>
              </div>
              {locateError && <p className="mt-1.5 text-xs font-medium text-red-600">{locateError}</p>}

              {formData.latitude != null && formData.longitude != null && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-slate-500">
                    Drag the pin to fine-tune the exact location.
                  </p>
                  <Map
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    title={formData.title || 'Property location'}
                    onMarkerDragEnd={handleMarkerDragEnd}
                  />
                  <p className="text-xs text-slate-500">
                    {formData.city && `${formData.city}, `}
                    {formData.state && `${formData.state}, `}
                    {formData.country} &middot; {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="bedrooms">
                  Bedrooms
                </label>
                <input
                  id="bedrooms"
                  type="number"
                  min="1"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-slate-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="bathrooms">
                  Bathrooms
                </label>
                <input
                  id="bathrooms"
                  type="number"
                  min="1"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="price">
                  Regular Price ($)
                </label>
                <input
                  id="price"
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-slate-500"
                />
              </div>
              {formData.offer && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="discountPrice">
                    Discount Price ($)
                  </label>
                  <input
                    id="discountPrice"
                    type="number"
                    min="0"
                    value={formData.discountPrice}
                    onChange={handleChange}
                    required={formData.offer}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-slate-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Status & Media */}
          <div className="space-y-6">
            <div className="space-y-3 rounded-2xl border border-slate-200 p-5 bg-slate-50">
              <span className="text-sm font-semibold text-slate-700 block">Property Options</span>
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2 font-medium text-slate-700">
                  <input
                    type="radio"
                    name="type"
                    id="type-rent"
                    value="rent"
                    checked={formData.type === 'rent'}
                    onChange={handleChange}
                    className="h-4 w-4 accent-slate-800"
                  />
                  Rent
                </label>
                <label className="flex items-center gap-2 font-medium text-slate-700">
                  <input
                    type="radio"
                    name="type"
                    id="type-sale"
                    value="sale"
                    checked={formData.type === 'sale'}
                    onChange={handleChange}
                    className="h-4 w-4 accent-slate-800"
                  />
                  Sale
                </label>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    id="parking"
                    type="checkbox"
                    checked={formData.parking}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-slate-800 accent-slate-800"
                  />
                  Parking Spot
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    id="furnished"
                    type="checkbox"
                    checked={formData.furnished}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-slate-800 accent-slate-800"
                  />
                  Furnished
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    id="offer"
                    type="checkbox"
                    checked={formData.offer}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-slate-800 accent-slate-800"
                  />
                  Special Offer (Discount)
                </label>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Image URLs (Add at least 1)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-slate-500"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-white font-medium hover:bg-slate-700 transition"
                >
                  Add
                </button>
              </div>

              {formData.imageUrls.length > 0 && (
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg p-2 text-xs">
                      <span className="truncate flex-1 text-slate-600">{url}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveImageUrl(index)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 py-3 text-white font-semibold hover:bg-slate-800 transition disabled:opacity-75"
            >
              {loading ? 'Creating listing...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CreateListing;
