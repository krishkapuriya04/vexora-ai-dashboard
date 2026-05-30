import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { isTokenInvalidated } from '../services/tokenService.js';

/**
 * Protect routes — verify JWT and attach user to request.
 */
export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];

    if (isTokenInvalidated(token)) {
      throw new AppError('Session expired. Please sign in again.', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
}

export default protect;
