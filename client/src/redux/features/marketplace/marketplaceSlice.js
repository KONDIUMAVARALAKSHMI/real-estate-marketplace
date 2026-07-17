import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const countryCurrencyMap = {
  'India': { code: 'INR', symbol: '₹', locale: 'en-IN' },
  'United States': { code: 'USD', symbol: '$', locale: 'en-US' },
  'Canada': { code: 'CAD', symbol: 'CA$', locale: 'en-CA' },
  'United Kingdom': { code: 'GBP', symbol: '£', locale: 'en-GB' },
  'Australia': { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
  'Japan': { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
  'Germany': { code: 'EUR', symbol: '€', locale: 'de-DE' },
  'France': { code: 'EUR', symbol: '€', locale: 'fr-FR' },
  'Singapore': { code: 'SGD', symbol: 'S$', locale: 'en-SG' },
  'United Arab Emirates': { code: 'AED', symbol: 'AED', locale: 'en-AE' }
};

export const countryList = Object.keys(countryCurrencyMap);

// Rates cache duration: 12 hours (in milliseconds)
const CACHE_DURATION = 12 * 60 * 60 * 1000;

export const fetchExchangeRates = createAsyncThunk(
  'marketplace/fetchExchangeRates',
  async (_, { rejectWithValue }) => {
    try {
      // Check cache first
      const cachedData = localStorage.getItem('exchangeRatesData');
      if (cachedData) {
        const { rates, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return rates;
        }
      }

      const response = await axios.get('https://open.er-api.com/v6/latest/USD');
      if (response.data && response.data.result === 'success') {
        const rates = response.data.rates;
        
        // Cache rates
        localStorage.setItem(
          'exchangeRatesData',
          JSON.stringify({ rates, timestamp: Date.now() })
        );
        return rates;
      }
      return rejectWithValue('Invalid API response structure');
    } catch (err) {
      // Return cached data even if expired if API fails, fallback to standard USD
      const cachedData = localStorage.getItem('exchangeRatesData');
      if (cachedData) {
        console.warn('API call failed, using expired cached rates as fallback');
        return JSON.parse(cachedData).rates;
      }
      return rejectWithValue(err.message || 'Failed to fetch rates');
    }
  }
);

// Load initial state from local storage where applicable
const getInitialCountry = () => {
  const stored = localStorage.getItem('selectedCountry');
  if (stored && countryCurrencyMap[stored]) return stored;
  return 'United States';
};

const getInitialCurrency = (country) => {
  return countryCurrencyMap[country]?.code || 'USD';
};

const initialState = {
  selectedCountry: getInitialCountry(),
  selectedCurrency: getInitialCurrency(getInitialCountry()),
  exchangeRates: { USD: 1 },
  userLocation: null, // { latitude, longitude }
  loadingRates: false,
  ratesError: null,
  theme: 'light', // added default theme
};

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setCountry: (state, action) => {
      const country = action.payload;
      if (countryCurrencyMap[country]) {
        state.selectedCountry = country;
        state.selectedCurrency = countryCurrencyMap[country].code;
        localStorage.setItem('selectedCountry', country);
      }
    },
    setUserLocation: (state, action) => {
      state.userLocation = action.payload; // { latitude, longitude }
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state) => {
        state.loadingRates = true;
        state.ratesError = null;
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.loadingRates = false;
        state.exchangeRates = action.payload;
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        state.loadingRates = false;
        state.ratesError = action.payload;
        console.error('Failed to load exchange rates:', action.payload);
      });
  }
});

export const { setCountry, setUserLocation, toggleTheme } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;
