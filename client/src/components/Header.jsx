import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaBars, FaTimes, FaGlobe, FaMoon, FaSun } from 'react-icons/fa';
import { logout } from '../redux/features/auth/authSlice.js';
import { setCountry, countryCurrencyMap } from '../redux/features/marketplace/marketplaceSlice.js';
import { toggleTheme } from '../redux/features/theme/themeSlice.js';
import api from '../services/api.js';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { selectedCountry } = useSelector((state) => state.marketplace);
  const { theme } = useSelector((state) => state.theme);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle scroll for sticky transparent-to-solid effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Determine header background logic based on route and scroll
  const isHomePage = location.pathname === '/';
  
  let headerClasses = "fixed top-0 z-50 w-full transition-all duration-300 ";
  if (isHomePage) {
    if (scrolled) {
      headerClasses += "bg-white/90 dark:bg-[#102F15]/95 backdrop-blur-md shadow-sm border-b border-[#728C5A]/15 dark:border-white/10";
    } else {
      // Hero is solid background (#EBFADC light / #102F15 dark) — match it
      headerClasses += "bg-[#EBFADC]/80 dark:bg-[#102F15]/80 backdrop-blur-sm border-b border-[#728C5A]/10 dark:border-white/5";
    }
  } else {
    // Other pages: always solid
    headerClasses += "bg-[#EBFADC] dark:bg-[#102F15] shadow-sm border-b border-[#728C5A]/20 dark:border-white/10";
  }

  // Text is always theme-aware since hero is a solid background (not dark photo)
  const textClass = "text-[#102F15] dark:text-white";
  const mutedTextClass = "text-gray-600 dark:text-gray-300";

  const activeLinkClass = `${textClass} font-semibold relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:bg-[#728C5A] dark:after:bg-[#728C5A] after:rounded-full`;
  const normalLinkClass = `${mutedTextClass} hover:${textClass} transition-colors relative`;

  return (
    <header className={headerClasses}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

        {/* Logo + Wordmark */}
        <Link
          to="/"
          aria-label="Go to homepage"
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm transition group-hover:opacity-90 ${isHomePage && !scrolled ? 'bg-white/20' : 'bg-[#728C5A]'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
              <path d="M9 21V12h6v9" />
            </svg>
          </span>
          <span
            className={`hidden sm:block text-xl font-bold tracking-tight transition-colors ${textClass}`}
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            EstateHub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLink to="/" className={({ isActive }) => isActive ? activeLinkClass : normalLinkClass}>
            Home
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => isActive ? activeLinkClass : normalLinkClass}>
            Search
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? activeLinkClass : normalLinkClass}>
            About
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? activeLinkClass : normalLinkClass}>
            Contact
          </NavLink>
        </nav>

        {/* Right Side Controls */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Theme Toggle */}
          <button 
            onClick={() => dispatch(toggleTheme())}
            className={`p-2 rounded-full transition-colors ${isHomePage && !scrolled ? 'text-white hover:bg-white/20' : 'text-[#728C5A] hover:bg-[#728C5A]/10 dark:text-gray-300 dark:hover:bg-white/10'}`}
          >
            {theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
          </button>

          {/* Country Selector */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ml-1 border transition-colors ${isHomePage && !scrolled ? 'border-white/30 text-white bg-white/10' : 'border-[#728C5A]/30 text-[#102F15] dark:text-white dark:border-white/20'}`}
          >
            <FaGlobe className="text-xs shrink-0" />
            <select
              value={selectedCountry}
              onChange={(e) => dispatch(setCountry(e.target.value))}
              aria-label="Select country"
              className="bg-transparent text-xs font-semibold outline-none cursor-pointer border-none p-0 appearance-none pr-2"
            >
              {Object.keys(countryCurrencyMap).map((country) => (
                <option key={country} value={country} className="text-[#102F15]">
                  {country}
                </option>
              ))}
            </select>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 ml-2">
              <NavLink
                to="/profile"
                className={`flex items-center gap-2 ${normalLinkClass}`}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-8 w-8 rounded-full object-cover border-2 border-[#728C5A]"
                  />
                ) : (
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white uppercase bg-[#728C5A]"
                  >
                    {user?.username?.[0] || 'U'}
                  </span>
                )}
                <span>{user?.username}</span>
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition border ${isHomePage && !scrolled ? 'border-white text-white hover:bg-white hover:text-[#102F15]' : 'border-[#102F15] text-[#102F15] hover:bg-[#102F15] hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-[#102F15]'}`}
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/sign-in"
              className={`ml-2 rounded-md px-6 py-2.5 text-sm font-semibold transition ${isHomePage && !scrolled ? 'bg-white text-[#102F15] hover:bg-white/90' : 'bg-[#728C5A] text-white hover:bg-[#61784c]'}`}
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Hamburger — mobile only */}
        <button
          type="button"
          aria-label="Toggle mobile menu"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className={`md:hidden flex items-center justify-center h-10 w-10 rounded-lg transition ${textClass}`}
        >
          {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t px-4 pb-6 pt-4 space-y-4 bg-[#EBFADC] dark:bg-[#102F15] border-[#728C5A]/20 dark:border-white/10"
        >
          <div className="flex flex-col gap-1 text-sm font-medium">
            <NavLink to="/" className={({ isActive }) => `block px-4 py-3 rounded-xl transition ${isActive ? 'bg-[#728C5A]/10 text-[#102F15] dark:bg-white/10 dark:text-white font-semibold' : 'text-[#102F15] dark:text-gray-300'}`}>Home</NavLink>
            <NavLink to="/search" className={({ isActive }) => `block px-4 py-3 rounded-xl transition ${isActive ? 'bg-[#728C5A]/10 text-[#102F15] dark:bg-white/10 dark:text-white font-semibold' : 'text-[#102F15] dark:text-gray-300'}`}>Search</NavLink>
            <NavLink to="/about" className={({ isActive }) => `block px-4 py-3 rounded-xl transition ${isActive ? 'bg-[#728C5A]/10 text-[#102F15] dark:bg-white/10 dark:text-white font-semibold' : 'text-[#102F15] dark:text-gray-300'}`}>About</NavLink>
            
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-[#102F15] dark:text-gray-300">Theme</span>
              <button 
                onClick={() => dispatch(toggleTheme())}
                className="p-2 rounded-full bg-[#728C5A]/10 dark:bg-white/10 text-[#728C5A] dark:text-white"
              >
                {theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
              </button>
            </div>

            {isAuthenticated ? (
              <>
                <NavLink to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#102F15] dark:text-white">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.username} className="h-8 w-8 rounded-full object-cover border-2 border-[#728C5A]" />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white bg-[#728C5A]">
                      {user?.username?.[0] || 'U'}
                    </span>
                  )}
                  {user?.username}
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/sign-in" className="block rounded-xl px-4 py-3 text-center text-sm font-semibold bg-[#728C5A] text-white">
                  Sign In
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