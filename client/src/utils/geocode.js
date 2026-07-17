/**
 * Free geocoding using the OpenStreetMap Nominatim API.
 * No API key required. Usage policy: keep requests light and identify
 * the app via a custom header where possible (browsers restrict some
 * headers, so we rely on the documented `email` query param instead).
 * Docs: https://nominatim.org/release-docs/latest/api/Search/
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

/**
 * Geocode a free-text address into coordinates + country/state/city.
 * @param {string} address
 * @returns {Promise<{ latitude: number, longitude: number, country: string, state: string, city: string, displayName: string }>}
 */
export const geocodeAddress = async (address) => {
  if (!address || !address.trim()) {
    throw new Error('Please enter an address first.');
  }

  const params = new URLSearchParams({
    q: address,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '1',
  });

  const response = await fetch(`${NOMINATIM_BASE}/search?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Geocoding service is unavailable right now.');
  }

  const results = await response.json();

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('Could not find that address. Try adding a city or country.');
  }

  const best = results[0];
  const addr = best.address || {};

  return {
    latitude: parseFloat(best.lat),
    longitude: parseFloat(best.lon),
    country: addr.country || '',
    state: addr.state || addr.region || addr.county || '',
    city: addr.city || addr.town || addr.village || addr.county || '',
    displayName: best.display_name,
  };
};

/**
 * Reverse geocode coordinates back into an address (used when a user
 * drags the map marker to fine-tune a pin location).
 * @param {number} latitude
 * @param {number} longitude
 */
export const reverseGeocode = async (latitude, longitude) => {
  const params = new URLSearchParams({
    lat: latitude,
    lon: longitude,
    format: 'jsonv2',
    addressdetails: '1',
  });

  const response = await fetch(`${NOMINATIM_BASE}/reverse?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Reverse geocoding service is unavailable right now.');
  }

  const result = await response.json();
  const addr = result.address || {};

  return {
    address: result.display_name || '',
    country: addr.country || '',
    state: addr.state || addr.region || addr.county || '',
    city: addr.city || addr.town || addr.village || addr.county || '',
  };
};
