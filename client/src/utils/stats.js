export const getPropertyStats = (selectedCountry) => {
  // Base global stats
  let totalProperties = 12500;
  let totalCities = 850;
  let activeUsers = 45000;
  let dailyTransactions = 12;

  if (selectedCountry && selectedCountry !== 'All Countries') {
    // Return mock scaled down stats for a specific country
    // Using simple hash function on country name to get deterministic numbers
    const hash = selectedCountry.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    const seed = Math.abs(hash) % 100;
    
    totalProperties = 500 + (seed * 20);
    totalCities = 10 + (seed % 50);
    activeUsers = 2000 + (seed * 100);
    dailyTransactions = 1 + (seed % 5);
  }

  return {
    totalProperties,
    totalCities,
    activeUsers,
    dailyTransactions
  };
};
