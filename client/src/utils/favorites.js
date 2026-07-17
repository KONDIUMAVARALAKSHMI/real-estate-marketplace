const STORAGE_KEY = 'estatehub_favorites';

export const getFavorites = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const isFavorite = (listingId) => getFavorites().includes(listingId);

export const toggleFavorite = (listingId) => {
  const current = getFavorites();
  const next = current.includes(listingId)
    ? current.filter((id) => id !== listingId)
    : [...current, listingId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};
