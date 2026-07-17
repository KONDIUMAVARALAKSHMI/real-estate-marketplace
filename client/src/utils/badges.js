// Derives display badges (Luxury, Sea View, Penthouse, Villa, Smart Home,
// Pool, Garden, Premium) from a listing's stored tier/amenities/title/price.
export const computeBadges = (listing) => {
  const badges = [];
  const amenities = listing.amenities || [];
  const title = listing.title || '';

  if (listing.tier === 'luxury') badges.push('Luxury');
  if (amenities.includes('Sea View')) badges.push('Sea View');
  if (/penthouse/i.test(title)) badges.push('Penthouse');
  if (/villa/i.test(title)) badges.push('Villa');
  if (amenities.includes('Smart Home System')) badges.push('Smart Home');
  if (amenities.includes('Swimming Pool')) badges.push('Pool');
  if (amenities.includes('Private Garden')) badges.push('Garden');

  const isPremiumPrice = listing.type === 'rent' ? listing.price >= 8000 : listing.price >= 2000000;
  if (isPremiumPrice) badges.push('Premium');

  return badges;
};
