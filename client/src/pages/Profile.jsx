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
    <main className="min-h-screen px-4 py-24 sm:px-6 lg:px-8 bg-[#EBFADC] dark:bg-[#102F15] transition-colors duration-500 pt-16">
      <div className="mx-auto max-w-6xl space-y-10">
        
        {/* Profile Title */}
        <div className="text-center sm:text-left">
          <h1 className="text-4xl text-[#102F15] dark:text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            My Account
          </h1>
          <p className="mt-2 text-sm text-[#728C5A] dark:text-gray-300">Manage your profile settings and real estate portfolio.</p>
        </div>

        {/* Profile Card & Info Form */}
        <section className="grid gap-8 md:grid-cols-3">
          
          {/* Avatar and Account Actions (Left Side) */}
          <div className="rounded-3xl border p-8 shadow-sm flex flex-col items-center text-center bg-white dark:bg-[#102F15] border-[#728C5A]/20 dark:border-white/10 transition-colors">
            <div className="space-y-4 w-full">
              <div className="relative inline-block h-36 w-36 overflow-hidden rounded-full border-4 shadow-inner mx-auto border-[#728C5A]/30 dark:border-white/20 bg-gray-50 dark:bg-black/20">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600">
                    <FaUser className="text-6xl" />
                  </div>
                )}
              </div>
              <div className="pt-2">
                <h2 className="text-2xl font-bold text-[#102F15] dark:text-white">{user?.username}</h2>
                <p className="text-sm font-medium mt-1 text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>

            <div className="mt-10 w-full flex flex-col gap-3">
              <Link
                to="/create-listing"
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-white font-semibold transition bg-[#728C5A] hover:bg-[#61784c] shadow-md"
              >
                <FaPlus className="text-sm" /> Add New Property
              </Link>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full rounded-xl py-3.5 text-sm font-semibold transition text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                Delete Account
              </button>
            </div>
          </div>

          {/* Profile Form (Right Side) */}
          <div className="md:col-span-2 rounded-3xl border p-8 sm:p-10 shadow-sm bg-white dark:bg-[#102F15] border-[#728C5A]/20 dark:border-white/10 transition-colors">
            <h2 className="text-2xl font-bold mb-8 text-[#102F15] dark:text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Profile Details</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#102F15] dark:text-white" htmlFor="username">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#728C5A]">
                      <FaUser className="text-sm" />
                    </span>
                    <input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl pl-11 pr-4 py-3 outline-none transition text-sm bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/20 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#102F15] dark:text-white" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#728C5A]">
                      <FaEnvelope className="text-sm" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl pl-11 pr-4 py-3 outline-none transition text-sm bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/20 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#102F15] dark:text-white" htmlFor="avatar">
                  Avatar Image URL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#728C5A]">
                    <FaImage className="text-sm" />
                  </span>
                  <input
                    id="avatar"
                    type="text"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full rounded-xl pl-11 pr-4 py-3 outline-none transition text-sm bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/20 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                  />
                </div>
              </div>

              <div className="border-t pt-6 mt-6 border-[#728C5A]/20 dark:border-white/10">
                <label className="mb-2 block text-sm font-semibold text-[#102F15] dark:text-white" htmlFor="password">
                  Change Password <span className="font-normal text-gray-500 dark:text-gray-400">(leave blank to keep current)</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 outline-none transition text-sm bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/20 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
                />
              </div>

              {error && <p className="text-sm font-semibold p-3 rounded-lg bg-red-100 text-red-700">{error}</p>}
              {updateSuccess && (
                <p className="text-sm font-semibold p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                  Profile updated successfully!
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl px-8 py-3.5 text-white font-semibold transition bg-[#728C5A] hover:bg-[#61784c] disabled:opacity-75 shadow-md"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* User Listings List */}
        <section className="rounded-3xl border p-8 sm:p-10 shadow-sm bg-white dark:bg-[#102F15] border-[#728C5A]/20 dark:border-white/10 transition-colors">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#102F15] dark:text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Your Portfolio</h2>
              <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Manage and edit your active property listings.</p>
            </div>
            <span className="inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-white/10 text-[#728C5A] dark:text-white">
              {listings.length} {listings.length === 1 ? 'Listing' : 'Listings'}
            </span>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-16 text-center border-[#728C5A]/30 dark:border-white/20 bg-gray-50 dark:bg-black/20">
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">You haven't added any properties yet.</p>
              <Link
                to="/create-listing"
                className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white transition bg-[#728C5A] hover:bg-[#61784c]"
              >
                <FaPlus className="text-xs" /> Create first listing
              </Link>
            </div>
          ) : (
            <div className="divide-y max-h-[600px] overflow-y-auto pr-2 custom-scrollbar border-[#728C5A]/10 dark:border-white/10">
              {listings.map((listing) => (
                <div key={listing._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-5">
                    <Link to={`/listing/${listing._id}`} className="shrink-0 relative overflow-hidden rounded-2xl group">
                      <img
                        src={listing.imageUrls[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=150&q=80'}
                        alt={listing.title}
                        className="h-24 w-32 object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    </Link>
                    <div className="min-w-0">
                      <span className="inline-block mb-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white bg-[#728C5A]">
                        For {listing.type}
                      </span>
                      <Link
                        to={`/listing/${listing._id}`}
                        className="block font-bold truncate text-lg transition-colors hover:underline text-[#102F15] dark:text-white"
                        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                      >
                        {listing.title}
                      </Link>
                      <p className="text-xs mt-1 truncate max-w-sm text-gray-500 dark:text-gray-400">
                        {listing.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <Link
                      to={`/update-listing/${listing._id}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border transition shadow-sm border-[#728C5A]/30 text-[#728C5A] hover:bg-[#728C5A] hover:text-white bg-white dark:bg-[#102F15]"
                      title="Edit Property"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteListing(listing._id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border transition shadow-sm border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white dark:bg-[#102F15]/40"
                      title="Delete Property"
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