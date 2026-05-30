import mongoose from 'mongoose';
import { AppError } from '../utils/errors.js';

/**
 * Reject requests when MongoDB is not connected.
 */
export function requireDB(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return next(new AppError('Database unavailable. Ensure MongoDB is running and restart the server.', 503));
  }
  return next();
}

export default { requireDB };
