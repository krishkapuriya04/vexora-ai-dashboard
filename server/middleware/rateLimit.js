/**
 * Simple in-memory rate limiter for AI endpoints.
 */
const buckets = new Map();

/**
 * @param {{ windowMs?: number, max?: number, keyFn?: (req: import('express').Request) => string }} options
 */
export function rateLimit({ windowMs = 15 * 60 * 1000, max = 10, keyFn = (req) => req.user?._id?.toString() || req.ip } = {}) {
  return (req, res, next) => {
    const key = keyFn(req) || req.ip;
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > max) {
      return res.status(429).json({
        success: false,
        message: 'Too many AI requests. Please try again later.',
      });
    }

    return next();
  };
}

export default { rateLimit };
