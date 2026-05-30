import cors from 'cors';
import env from './env.js';

/**
 * CORS middleware — production uses CORS_ORIGIN; development allows local origins.
 */
export function createCorsMiddleware() {
  if (env.corsAllowAll) {
    return cors({ origin: true, credentials: true });
  }

  const allowed = new Set(env.corsOrigins);

  return cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowed.has(origin)) {
        return callback(null, true);
      }

      if (!env.isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      if (!env.isProduction && /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  });
}

export default createCorsMiddleware;
