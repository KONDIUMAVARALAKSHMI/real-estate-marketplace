import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { updateUser as updateReduxUser, logout } from '../redux/features/auth/authSlice.js';
import api from '../services/api.js';
import { FaTrash, FaEdit, FaPlus, FaUser, FaEnvelope, FaImage } from 'react-icons/fa';

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    avatar: user?.avatar || '',
  });

  const [listings, setListings] = useState([]);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserListings = async () => {
      if (!user?._id) return;
      try {
        const res = await api.get(`/user/listings/${user._id}`);
        if (res.data.success) {
          setListings(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch user listings', err);
      }
    };

    fetchUserListings();
  }, [user]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setUpdateSuccess(false);
    setLoading(true);

    try {
      const res = await api.put(`/user/update/${user._id}`, formData);
      setLoading(false);
      if (res.data.success) {
        dispatch(updateReduxUser(res.data.data));
        setUpdateSuccess(true);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm('Are you absolutely sure you want to delete your account? This action is permanent and will delete all your listings.');
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/user/delete/${user._id}`);
      if (res.data.success) {
        dispatch(logout());
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  const handleDeleteListing = async (listingId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this listing?');
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/listing/delete/${listingId}`);
      if (res.data.success) {
        setListings((prev) => prev.filter((listing) => listing._id !== listingId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Profile Card & Info Form */}
        <section className="grid gap-8 md:grid-cols-3">
          
          {/* Avatar and Account Actions (Left Side) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-between text-center">
            <div className="space-y-4 w-full">
              <div className="relative inline-block h-32 w-32 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-inner">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <FaUser className="text-5xl" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{user?.username}</h2>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            <div className="mt-8 w-full space-y-3">
              <Link
                to="/create-listing"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-white font-semibold hover:bg-slate-800 transition"
              >
                <FaPlus className="text-sm" /> Create Listing
              </Link>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full rounded-xl border border-rose-200 bg-rose-50 py-3 text-rose-700 font-semibold hover:bg-rose-100 hover:text-rose-800 transition text-sm"
              >
                Delete Account
              </button>
            </div>
          </div>

          {/* Profile Form (Right Side) */}
          <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Profile Settings</h1>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="username">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <FaUser className="text-sm" />
                  </span>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 outline-none transition focus:border-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <FaEnvelope className="text-sm" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 outline-none transition focus:border-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="password">
                  Password (Leave blank to keep same)
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="avatar">
                  Avatar Image URL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <FaImage className="text-sm" />
                  </span>
                  <input
                    id="avatar"
                    type="text"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 outline-none transition focus:border-slate-500"
                  />
                </div>
              </div>

              {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
              {updateSuccess && (
                <p className="text-sm font-semibold text-emerald-600">
                  Profile updated successfully!
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-white font-semibold hover:bg-slate-800 transition disabled:opacity-75"
              >
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </section>

        {/* User Listings List */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Your Property Listings</h2>
            <p className="text-sm text-slate-500 mt-1">Manage and edit your active properties.</p>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
              <p className="font-medium">You haven't created any property listings yet.</p>
              <Link
                to="/create-listing"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 hover:underline"
              >
                Create your first listing <FaPlus className="text-xs" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2">
              {listings.map((listing) => (
                <div key={listing._id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <img
                      src={listing.imageUrls[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=150&q=80'}
                      alt={listing.title}
                      className="h-16 w-16 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                    />
                    <div>
                      <Link
                        to={`/listing/${listing._id}`}
                        className="font-bold text-slate-900 hover:underline line-clamp-1"
                      >
                        {listing.title}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {listing.address}
                      </p>
                      <span className="inline-block mt-1 bg-slate-100 text-slate-800 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {listing.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/update-listing/${listing._id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                      title="Edit"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteListing(listing._id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

export default Profile;