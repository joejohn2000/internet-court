/* ── Storage helpers ── */
export const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('ic_user') || 'null'); }
  catch { return null; }
};

export const storeUser = (u) => localStorage.setItem('ic_user', JSON.stringify(u));

export const clearUser = () => {
  localStorage.removeItem('ic_user');
  localStorage.removeItem('ic_token');
};
