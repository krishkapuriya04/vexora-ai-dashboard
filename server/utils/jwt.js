import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Sign a JWT for an authenticated user.
 * @param {string} userId
 * @param {boolean} rememberMe
 */
export function signToken(userId, rememberMe = false) {
  const expiresIn = rememberMe ? env.jwtRememberExpiresIn : env.jwtExpiresIn;

  return jwt.sign({ userId }, env.jwtSecret, { expiresIn });
}

/**
 * Verify a JWT and return the decoded payload.
 * @param {string} token
 */
export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export default { signToken, verifyToken };
