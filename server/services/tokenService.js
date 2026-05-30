/** In-memory JWT blacklist for logout invalidation */
const invalidatedTokens = new Set();

export function invalidateToken(token) {
  if (token) invalidatedTokens.add(token);
}

export function isTokenInvalidated(token) {
  return invalidatedTokens.has(token);
}

export default { invalidateToken, isTokenInvalidated };
