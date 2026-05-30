import { validationResult } from 'express-validator';
import { AppError } from '../utils/errors.js';

/**
 * Return validation errors from express-validator chains.
 */
export function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array().map((err) => err.msg).join('. ');
    return next(new AppError(message, 400));
  }

  return next();
}

export default validateRequest;
