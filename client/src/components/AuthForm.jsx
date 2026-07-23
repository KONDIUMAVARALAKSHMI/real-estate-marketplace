import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../redux/features/auth/authThunks.js';

function AuthForm({ mode = 'login' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const isRegister = mode === 'register';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isRegister) {
      const result = await dispatch(registerUser(formData));
      if (registerUser.fulfilled.match(result)) navigate('/profile');
      return;
    }
    const result = await dispatch(loginUser({ email: formData.email, password: formData.password }));
    if (loginUser.fulfilled.match(result)) navigate('/profile');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-[#EBFADC] dark:bg-[#102F15] transition-colors duration-500 pt-16">
      <div
        className="w-full max-w-md rounded-3xl p-8 sm:p-10 bg-white dark:bg-[#102F15]/90 border border-[#728C5A]/20 dark:border-white/10 shadow-2xl transition-colors"
      >
        {/* Brand mark */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4 bg-[#728C5A]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
              <path d="M9 21V12h6v9" />
            </svg>
          </div>
          <h1
            className="text-3xl text-[#102F15] dark:text-white"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontWeight: 800 }}
          >
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {isRegister
              ? 'Join EstateHub to manage listings and favorites.'
              : 'Sign in to continue exploring luxury properties.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#102F15] dark:text-white" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/20 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#102F15] dark:text-white" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/20 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#102F15] dark:text-white" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition bg-gray-50 dark:bg-black/20 text-[#102F15] dark:text-white border border-[#728C5A]/20 dark:border-white/10 focus:border-[#728C5A] focus:ring-2 focus:ring-[#728C5A]/20"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-semibold text-white transition bg-[#728C5A] hover:bg-[#61784c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Please wait…' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <Link
            to={isRegister ? '/sign-in' : '/sign-up'}
            className="font-semibold hover:underline text-[#728C5A]"
          >
            {isRegister ? 'Sign in' : 'Create one'}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthForm;
