import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaSearch, FaBars, FaTimes, FaGlobe, FaHome } from 'react-icons/fa';
import { logout } from '../redux/features/auth/authSlice.js';
import { setCountry, countryCurrencyMap } from '../redux/features/marketplace/marketplaceSlice.js';
import api from '../services/api.js';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { selectedCountry } = useSelector((state) => state.marketplace);

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Sync search input with URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm') || '';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchTerm(searchTermFromUrl);
  }, [location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/signout');
    } catch (err) {
      console.error('Signout request failed', err);
    } finally {
      dispatch(logout());
      navigate('/');
    }
  };

  const activeLinkClass = 'text-slate-900 font-semibold';
  const normalLinkClass = 'text-slate-600 hover:text-slate-900 transition-colors';

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

        {/* Minimal icon logo */}
        <Link
          to="/"
          aria-label="Go to homepage"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white transition hover:bg-slate-800"
        >
          <FaHome aria-hidden="true" className="text-lg" />
        </Link>

        {/* Search Bar — hidden on very small screens, shown from sm up */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden sm:flex flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 max-w-xs sm:max-w-md"
        >
          <button type="submit" className="mr-2 text-slate-500 hover:text-slate-800 cursor-pointer">
            <FaSearch />
          </button>
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm outline-none text-slate-700"
          />
        </form>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
          <NavLink to="/" className={({ isActive }) => isActive ? activeLinkClass : normalLinkClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? activeLinkClass : normalLinkClass}>
            About
          </NavLink>

          {/* Country Selector Dropdown */}
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 ml-2">
            <FaGlobe className="text-slate-400 text-xs shrink-0" />
            <select
              value={selectedCountry}
              onChange={(e) => dispatch(setCountry(e.target.value))}
              aria-label="Select country"
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer border-none p-0"
              style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', paddingRight: '8px' }}
            >
              {Object.keys(countryCurrencyMap).map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 ${isActive ? activeLinkClass : normalLinkClass}`
                }
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-7 w-7 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 uppercase">
                    {user?.username?.[0] || 'U'}
                  </span>
                )}
                <span>{user?.username}</span>
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-300 px-3.5 py-1.5 text-xs text-slate-700 transition hover:border-slate-500 hover:text-slate-950 cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <NavLink to="/sign-in" className={({ isActive }) => isActive ? activeLinkClass : normalLinkClass}>
                Sign in
              </NavLink>
              <Link to="/sign-up" className="rounded-full bg-slate-800 px-4 py-2 text-xs text-white transition hover:bg-slate-700">
                Sign up
              </Link>
            </>
          )}
        </nav>

        {/* Hamburger Button — visible on mobile only */}
        <button
          type="button"
          id="mobile-menu-toggle"
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-6 pt-4 space-y-4" id="mobile-menu">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
            <button type="submit" className="mr-2 text-slate-500 cursor-pointer">
              <FaSearch />
            </button>
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none text-slate-700"
            />
          </form>

          {/* Mobile Nav Links */}
          <div className="flex flex-col gap-1 text-sm font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl ${isActive ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl ${isActive ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
              }
            >
              About
            </NavLink>

            {/* Mobile Country Selector */}
            <div className="px-3 py-2.5 border-y border-slate-100 my-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FaGlobe className="text-slate-400" /> Country
              </span>
              <select
                value={selectedCountry}
                onChange={(e) => dispatch(setCountry(e.target.value))}
                aria-label="Select country"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none"
              >
                {Object.keys(countryCurrencyMap).map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl ${isActive ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
                  }
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.username} className="h-7 w-7 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 uppercase">
                      {user?.username?.[0] || 'U'}
                    </span>
                  )}
                  {user?.username}
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <NavLink
                  to="/sign-in"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-xl ${isActive ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
                  }
                >
                  Sign in
                </NavLink>
                <Link to="/sign-up" className="block rounded-xl bg-slate-800 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-slate-700 transition">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;