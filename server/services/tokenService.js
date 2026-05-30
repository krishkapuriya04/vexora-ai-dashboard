/** In-memory JWT blacklist for logout invalidation */
const invalidatedTokens = new Set();

/** Active session tokens (logged-in users) */
const activeSessions = new Set();

export function registerSession(token) {
  if (token) activeSessions.add(token);
}

export function removeSession(token) {
  if (token) activeSessions.delete(token);
}

export function getActiveSessionCount() {
  return activeSessions.size;
}

export function invalidateToken(token) {
  if (token) {
    invalidatedTokens.add(token);
    activeSessions.delete(token);
  }
}

export function isTokenInvalidated(token) {
  return invalidatedTokens.has(token);
}

export default {
  invalidateToken,
  isTokenInvalidated,
  registerSession,
  removeSession,
  getActiveSessionCount,
};
