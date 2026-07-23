import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { countryList } from '../redux/features/marketplace/marketplaceSlice.js';

const POPULAR_CITIES = ['New York', 'Mumbai', 'Tokyo', 'London', 'Sydney', 'Dubai'];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#102F15] dark:bg-[#0a1f0d] text-white/80 transition-colors duration-500 border-t border-[#728C5A]/10">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm transition group-hover:opacity-90 bg-[#728C5A]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                  <path d="M9 21V12h6v9" />
                </svg>
              </span>
              <span
                className="text-xl text-white"
                style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontWeight: 700 }}
              >
                EstateHub
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              A modern, international luxury real estate marketplace for buyers, sellers, and renters across ten countries.
            </p>
            <div className="mt-5 flex items-center gap-4 text-white/50">
              <a href="#" aria-label="Facebook" className="transition hover:text-[#EBFADC]"><FaFacebook aria-hidden="true" /></a>
              <a href="#" aria-label="Twitter" className="transition hover:text-[#EBFADC]"><FaTwitter aria-hidden="true" /></a>
              <a href="#" aria-label="Instagram" className="transition hover:text-[#EBFADC]"><FaInstagram aria-hidden="true" /></a>
              <a href="#" aria-label="LinkedIn" className="transition hover:text-[#EBFADC]"><FaLinkedin aria-hidden="true" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="text-xs font-bold uppercase tracking-widest mb-4 text-[#728C5A]"
            >
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link to="/" className="transition hover:text-white">Home</Link></li>
              <li><Link to="/search?country=all" className="transition hover:text-white">Browse Properties</Link></li>
              <li><Link to="/about" className="transition hover:text-white">About</Link></li>
              <li><Link to="/create-listing" className="transition hover:text-white">List a Property</Link></li>
            </ul>
          </div>

          {/* Countries */}
          <div>
            <h3
              className="text-xs font-bold uppercase tracking-widest mb-4 text-[#728C5A]"
            >
              Countries
            </h3>
            <ul className="space-y-2.5 text-sm text-white/70">
              {countryList.slice(0, 6).map((c) => (
                <li key={c}>
                  <Link to={`/search?country=${encodeURIComponent(c)}`} className="transition hover:text-white">{c}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Cities */}
          <div>
            <h3
              className="text-xs font-bold uppercase tracking-widest mb-4 text-[#728C5A]"
            >
              Popular Cities
            </h3>
            <ul className="space-y-2.5 text-sm text-white/70">
              {POPULAR_CITIES.map((city) => (
                <li key={city}>
                  <Link to={`/search?city=${encodeURIComponent(city)}`} className="transition hover:text-white">{city}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t grid gap-4 sm:flex sm:items-center sm:justify-between border-[#728C5A]/20">
          <p className="text-xs text-white/50">
            &copy; {year} EstateHub International. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-white/50">
            <Link to="/privacy" className="transition hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="transition hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
