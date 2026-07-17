import { countryCurrencyMap } from '../redux/features/marketplace/marketplaceSlice';

/**
 * Converts a USD base price into the target country's currency as a raw number
 * (no formatting/symbol). Useful for calculations like mortgage estimates.
 */
export const convertPrice = (priceInUsd, targetCountry, exchangeRates) => {
  if (priceInUsd === undefined || priceInUsd === null) return 0;
  const countryInfo = countryCurrencyMap[targetCountry] || { code: 'USD' };
  const currencyCode = countryInfo.code;
  const rate = exchangeRates && exchangeRates[currencyCode] ? exchangeRates[currencyCode] : 1;
  return priceInUsd * rate;
};

const buildFormatter = (targetCountry) => {
  const countryInfo = countryCurrencyMap[targetCountry] || { code: 'USD', symbol: '$' };
  const currencyCode = countryInfo.code;

  let locale = countryInfo.locale;
  if (!locale) {
    if (currencyCode === 'INR') locale = 'en-IN';
    else if (currencyCode === 'JPY') locale = 'ja-JP';
    else if (currencyCode === 'EUR') locale = 'de-DE';
    else if (currencyCode === 'GBP') locale = 'en-GB';
    else if (currencyCode === 'AED') locale = 'en-AE';
    else if (currencyCode === 'SGD') locale = 'en-SG';
    else if (currencyCode === 'CAD') locale = 'en-CA';
    else if (currencyCode === 'AUD') locale = 'en-AU';
    else locale = 'en-US';
  }

  return { currencyCode, currencySymbol: countryInfo.symbol, locale };
};

/**
 * Formats an amount that is ALREADY in the target country's currency
 * (no conversion applied) — e.g. output from convertPrice() or a mortgage
 * calculation performed in local currency.
 */
export const formatLocalAmount = (amount, targetCountry) => {
  if (amount === undefined || amount === null || Number.isNaN(amount)) return '';
  const { currencyCode, currencySymbol, locale } = buildFormatter(targetCountry);

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(amount);
  } catch {
    return `${currencySymbol}${Math.round(amount).toLocaleString()}`;
  }
};

/**
 * Converts and formats a price from USD to a target country's currency.
 * @param {number} priceInUsd - The base price in USD
 * @param {string} targetCountry - Selected country name (e.g. 'India')
 * @param {object} exchangeRates - Redux-stored exchange rates relative to USD
 * @returns {string} Formatted price string (e.g., "₹3,50,00,000" or "$1,250,000")
 */
export const formatPrice = (priceInUsd, targetCountry, exchangeRates) => {
  if (priceInUsd === undefined || priceInUsd === null) return '';
  const convertedPrice = convertPrice(priceInUsd, targetCountry, exchangeRates);
  return formatLocalAmount(convertedPrice, targetCountry);
};
