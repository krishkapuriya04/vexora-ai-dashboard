/**
 * VEXORA Auth Client
 * Token storage, session validation, and API helpers.
 */

const TOKEN_KEY = 'vexora-auth-token';
const USER_KEY = 'vexora-auth-user';
const REMEMBER_KEY = 'vexora-auth-remember';
const BACKEND_PORT = '5000';

const STATIC_HOSTS = ['github.io', 'githubusercontent.com', 'gitlab.io', 'netlify.app', 'vercel.app'];

function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

function isPrivateLan(hostname) {
  return /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
}

function isStaticOnlyHost(hostname) {
  return STATIC_HOSTS.some((h) => hostname.includes(h));
}

/** @returns {string} */
export function getApiBase() {
  if (typeof window !== 'undefined' && window.VEXORA_API_BASE) {
    return String(window.VEXORA_API_BASE).replace(/\/$/, '');
  }

  const { protocol, hostname, port } = window.location;
  const pagePort = port || '';

  if (isLocalHost(hostname) || isPrivateLan(hostname)) {
    if (!pagePort || pagePort !== BACKEND_PORT) {
      return `${protocol}//${hostname}:${BACKEND_PORT}`;
    }
    return `${protocol}//${hostname}:${BACKEND_PORT}`;
  }

  if (isStaticOnlyHost(hostname)) {
    return `http://localhost:${BACKEND_PORT}`;
  }

  return `${protocol}//${hostname}${pagePort ? `:${pagePort}` : ''}`;
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

function formatApiError(response, data, path) {
  if (data?.message) return data.message;

  if (response.status === 503) {
    return 'Database unavailable. Start MongoDB and run npm start.';
  }

  if (response.status === 404 || response.status === 405) {
    return `API not found at ${getApiBase()}${path}. Run npm start (port ${BACKEND_PORT}) and open http://localhost:${BACKEND_PORT}/pages/signup.html`;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return `Server returned an invalid response (${response.status}). Ensure the VEXORA backend is running: npm start`;
  }

  return `Request failed (${response.status})`;
}

/**
 * @param {string} path
 * @param {RequestInit} [options]
 */
async function apiRequest(path, options = {}) {
  const url = `${getApiBase()}${path}`;
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new Error(
      `Cannot connect to VEXORA API at ${getApiBase()}. Run npm start and ensure MongoDB is running.`,
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(formatApiError(response, data, path));
  }

  return data;
}

/**
 * Verify the backend API is reachable.
 */
export async function checkApiHealth() {
  return apiRequest('/api/health');
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

/** @param {Object} payload */
export async function updateProfile(payload) {
  return apiRequest('/api/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/** @param {Object} payload */
export async function updateWorkspace(payload) {
  return apiRequest('/api/auth/organization', {
    method: 'PATCH',
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
  checkApiHealth,
  validateSession,
  register,
  login,
  updateProfile,
  updateWorkspace,
  logout,
  applyUserToShell,
  getInitials,
};
