/**
 * VEXORA Auth Client
 * Token storage, session validation, and API helpers.
 */

const TOKEN_KEY = 'vexora-auth-token';
const USER_KEY = 'vexora-auth-user';
const REMEMBER_KEY = 'vexora-auth-remember';

/** @returns {string} */
export function getApiBase() {
  if (window.VEXORA_API_BASE) return window.VEXORA_API_BASE.replace(/\/$/, '');

  const { protocol, hostname, port } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:5000`;
  }

  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
}

function getActiveStorage() {
  return localStorage.getItem(REMEMBER_KEY) === 'true' ? localStorage : sessionStorage;
}

/** @returns {string|null} */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

/** @returns {Object|null} */
export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Persist auth session after login or register.
 * @param {{ token: string, user: Object, rememberMe?: boolean }} payload
 */
export function setAuth({ token, user, rememberMe = false }) {
  clearAuth(false);

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));

  if (rememberMe) {
    localStorage.setItem(REMEMBER_KEY, 'true');
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
}

/**
 * Clear stored credentials.
 * @param {boolean} [removeRememberFlag=true]
 */
export function clearAuth(removeRememberFlag = true) {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);

  if (removeRememberFlag) {
    localStorage.removeItem(REMEMBER_KEY);
  }
}

/** @returns {boolean} */
export function isAuthenticated() {
  return Boolean(getToken());
}

/**
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'VX';
}

/**
 * @param {string} path
 * @param {RequestInit} [options]
 */
async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

/**
 * Validate session with backend and return user profile.
 * Redirects to login when invalid.
 */
export async function validateSession() {
  const token = getToken();

  if (!token) {
    window.location.href = 'login.html';
    return null;
  }

  try {
    const data = await apiRequest('/api/auth/profile');
    getActiveStorage().setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  } catch {
    clearAuth();
    window.location.href = 'login.html';
    return null;
  }
}

/** @param {{ fullName: string, email: string, password: string, role?: string }} payload */
export async function register(payload) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** @param {{ email: string, password: string, rememberMe?: boolean }} payload */
export async function login(payload) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logout() {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' });
  } catch {
    /* Clear local session even if API is unreachable */
  }

  clearAuth();
  window.location.href = 'login.html';
}

/**
 * Update shell profile UI with authenticated user data.
 * @param {Object} user
 */
export function applyUserToShell(user) {
  if (!user) return;

  const initials = getInitials(user.fullName);

  document.querySelectorAll('.topbar__avatar, .profile-panel__avatar').forEach((el) => {
    el.textContent = initials;
  });

  document.querySelectorAll('.topbar__profile-name, .profile-panel__name').forEach((el) => {
    el.textContent = user.fullName;
  });

  document.querySelectorAll('.topbar__profile-role').forEach((el) => {
    el.textContent = user.role;
  });

  document.querySelectorAll('.profile-panel__email').forEach((el) => {
    el.textContent = user.email;
  });
}

export default {
  getApiBase,
  getToken,
  getStoredUser,
  setAuth,
  clearAuth,
  isAuthenticated,
  validateSession,
  register,
  login,
  logout,
  applyUserToShell,
  getInitials,
};
