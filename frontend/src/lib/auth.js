/* ── Storage helpers ── */
const guestAdjectives = [
  'Curious',
  'Blue',
  'Quiet',
  'Swift',
  'Bold',
  'Clever',
  'Kind',
  'Bright',
];

const guestAnimals = [
  'Otter',
  'Falcon',
  'Panda',
  'Fox',
  'Lynx',
  'Heron',
  'Raven',
  'Coyote',
];

export const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('ic_user') || 'null'); }
  catch { return null; }
};

export const storeUser = (u) => localStorage.setItem('ic_user', JSON.stringify(u));

export const getStoredGuestIdentity = () => localStorage.getItem('ic_guest_identity') || '';

export const ensureGuestIdentity = () => {
  const existingIdentity = getStoredGuestIdentity();
  if (existingIdentity) return existingIdentity;

  const adjective = guestAdjectives[Math.floor(Math.random() * guestAdjectives.length)];
  const animal = guestAnimals[Math.floor(Math.random() * guestAnimals.length)];
  const identity = `${adjective}${animal}`;
  localStorage.setItem('ic_guest_identity', identity);
  return identity;
};

export const clearUser = () => {
  localStorage.removeItem('ic_user');
  localStorage.removeItem('ic_token');
};

export const clearGuestIdentity = () => {
  localStorage.removeItem('ic_guest_identity');
};
