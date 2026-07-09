/* ============================================================
   CarSparePartSys — Auth Module
   JWT token management, user state, route guards,
   and navbar auth state updates.
   ============================================================ */

const AUTH_TOKEN_KEY = 'csps_token';
const AUTH_USER_KEY = 'csps_user';

// ================================================================
//  TOKEN MANAGEMENT
// ================================================================

/** Save JWT token to localStorage */
function saveToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/** Get JWT token from localStorage */
function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/** Remove JWT token */
function removeToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

// ================================================================
//  USER DATA
// ================================================================

/** Save user profile data */
function saveUser(user) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

/** Get stored user profile */
function getUser() {
  try {
    const data = localStorage.getItem(AUTH_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/** Remove user data */
function removeUser() {
  localStorage.removeItem(AUTH_USER_KEY);
}

// ================================================================
//  JWT DECODING (without external library)
// ================================================================

/** Decode JWT payload (base64url → JSON) */
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64url → base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Check if a JWT token is expired */
function isTokenExpired(token) {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  // exp is in seconds, Date.now() is in ms
  return Date.now() >= payload.exp * 1000;
}

// ================================================================
//  AUTH STATE CHECKS
// ================================================================

/** Check if user is currently logged in (token exists and not expired) */
function isLoggedIn() {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

/** Check if current user has admin role */
function isAdmin() {
  const token = getToken();
  if (!token) return false;
  const payload = decodeJWT(token);
  if (!payload) return false;
  // Common JWT role claim names
  const role =
    payload.role ||
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
    '';
  return role === 'Admin' || role === 'admin';
}

/** Get user ID from JWT */
function getUserId() {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJWT(token);
  if (!payload) return null;
  return (
    payload.sub ||
    payload.userId ||
    payload.nameid ||
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
    null
  );
}

// ================================================================
//  ROUTE GUARDS
// ================================================================

/** Redirect to login if not authenticated */
function requireAuth(redirectUrl = '/login.html') {
  if (!isLoggedIn()) {
    // Save intended destination
    const currentPage = window.location.pathname + window.location.search;
    if (currentPage !== redirectUrl) {
      sessionStorage.setItem('csps_redirect', currentPage);
    }
    window.location.href = redirectUrl;
    return false;
  }
  return true;
}

/** Redirect to home if not admin */
function requireAdmin() {
  if (!requireAuth()) return false;
  if (!isAdmin()) {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

/** Redirect away from auth pages if already logged in */
function redirectIfLoggedIn(destination = '/index.html') {
  if (isLoggedIn()) {
    window.location.href = destination;
    return true;
  }
  return false;
}

// ================================================================
//  LOGIN / LOGOUT ACTIONS
// ================================================================

/** Handle successful login response */
function handleLoginSuccess(response) {
  const token = response?.accessToken || response?.AccessToken || response?.token || response?.Token || response?.access_token || response?.accessToken;
  const user = response?.user || response?.User || response?.profile || response?.Profile || response?.userDto || null;

  if (token) saveToken(token);
  if (user) saveUser(user);

  // Update navbar auth state
  updateNavbarAuthState();
  // Update cart badge
  if (typeof updateCartBadge === 'function') updateCartBadge();

  // Redirect to saved destination or home
  const redirect = sessionStorage.getItem('csps_redirect') || '/index.html';
  sessionStorage.removeItem('csps_redirect');
  window.location.href = redirect;
}

/** Handle logout */
function handleLogout() {
  removeToken();
  removeUser();
  window.location.href = '/index.html';
}

// ================================================================
//  NAVBAR AUTH STATE
// ================================================================

/** Update navbar to reflect current auth state */
function updateNavbarAuthState() {
  const authLinks = document.getElementById('auth-links');
  const userMenu = document.getElementById('user-menu');

  if (!authLinks || !userMenu) return;

  if (isLoggedIn()) {
    const user = getUser();
    authLinks.style.display = 'none';
    userMenu.style.display = 'block';

    // Set user initials in avatar
    const avatar = userMenu.querySelector('.avatar');
    if (avatar && user) {
      const initials =
        (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
      avatar.textContent = initials.toUpperCase() || 'U';
    }

    // Show/hide admin link
    const adminLink = userMenu.querySelector('[data-admin-link]');
    if (adminLink) {
      adminLink.style.display = isAdmin() ? 'flex' : 'none';
    }
  } else {
    authLinks.style.display = 'flex';
    userMenu.style.display = 'none';
  }
}

// ── Export to window ──
window.Auth = {
  saveToken,
  getToken,
  removeToken,
  saveUser,
  getUser,
  removeUser,
  decodeJWT,
  isLoggedIn,
  isAdmin,
  getUserId,
  requireAuth,
  requireAdmin,
  redirectIfLoggedIn,
  handleLoginSuccess,
  handleLogout,
  updateNavbarAuthState,
};
