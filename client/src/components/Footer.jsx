import { Link } from 'react-router-dom';
import { FaHome, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { countryList } from '../redux/features/marketplace/marketplaceSlice.js';

const POPULAR_CITIES = ['New York', 'Mumbai', 'Tokyo', 'London', 'Sydney', 'Dubai'];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-700">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <FaHome aria-hidden="true" />
              </span>
              <span className="text-lg font-bold text-slate-900">EstateHub</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              A modern, international real estate marketplace for buyers, sellers, and renters
              across ten countries.
            </p>
            <div className="mt-5 flex items-center gap-3 text-slate-400">
              <a href="#" aria-label="Facebook" className="transition hover:text-slate-900"><FaFacebook aria-hidden="true" /></a>
              <a href="#" aria-label="Twitter" className="transition hover:text-slate-900"><FaTwitter aria-hidden="true" /></a>
              <a href="#" aria-label="Instagram" className="transition hover:text-slate-900"><FaInstagram aria-hidden="true" /></a>
              <a href="#" aria-label="LinkedIn" className="transition hover:text-slate-900"><FaLinkedin aria-hidden="true" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Quick Links</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li><Link to="/" className="hover:text-slate-900">Home</Link></li>
              <li><Link to="/search?country=all" className="hover:text-slate-900">Browse Properties</Link></li>
              <li><Link to="/about" className="hover:text-slate-900">About</Link></li>
              <li><Link to="/create-listing" className="hover:text-slate-900">List a Property</Link></li>
            </ul>
          </div>

          {/* Countries */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Countries</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              {countryList.slice(0, 6).map((c) => (
                <li key={c}>
                  <Link to={`/search?country=${encodeURIComponent(c)}`} className="hover:text-slate-900">{c}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Cities + Support */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Popular Cities</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              {POPULAR_CITIES.map((city) => (
                <li key={city}>
                  <Link to={`/search?city=${encodeURIComponent(city)}`} className="hover:text-slate-900">{city}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 grid gap-4 border-t border-slate-100 pt-6 sm:flex sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
            <Link to="/contact" className="hover:text-slate-900">Support</Link>
            <Link to="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-900">Terms</Link>
            <Link to="/contact" className="hover:text-slate-900">Contact</Link>
          </div>
          <p className="text-xs text-slate-400">&copy; {year} EstateHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
