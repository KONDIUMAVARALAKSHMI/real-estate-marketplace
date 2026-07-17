// Deterministically derives plausible distance-based indicators for a listing
// (schools, hospitals, airport, metro, restaurants, walk score) from its ID,
// so the same listing always shows the same numbers. No business names are
// fabricated — only generic, distance-based indicators are shown.

const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

const mulberry32 = (seedInput) => {
  let seed = seedInput | 0;
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const getNearbyIndicators = (listingId) => {
  const rand = mulberry32(hashString(listingId || 'default'));

  return {
    nearestSchoolKm: Number((0.3 + rand() * 2.2).toFixed(1)),
    nearestHospitalKm: Number((0.5 + rand() * 4.5).toFixed(1)),
    nearestAirportKm: Number((4 + rand() * 26).toFixed(1)),
    nearestMetroKm: Number((0.2 + rand() * 1.8).toFixed(1)),
    restaurantsWithin1km: Math.round(3 + rand() * 27),
    walkScore: Math.round(40 + rand() * 55),
  };
};

export const walkScoreLabel = (score) => {
  if (score >= 90) return "Walker's Paradise";
  if (score >= 70) return 'Very Walkable';
  if (score >= 50) return 'Somewhat Walkable';
  return 'Car-Dependent';
};
