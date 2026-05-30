import env from './env.js';

const DEV_JWT = 'vexora-dev-secret-change-in-production';

/**
 * Validate required environment variables at startup.
 * Exits process in production when critical config is missing.
 */
export function validateEnv() {
  const errors = [];
  const warnings = [];

  if (!env.mongoUri) {
    errors.push('MONGODB_URI is required');
  }

  if (env.isProduction) {
    if (!process.env.JWT_SECRET || env.jwtSecret === DEV_JWT) {
      errors.push('JWT_SECRET must be set to a strong random value in production');
    }

    if (env.jwtSecret.length < 32) {
      warnings.push('JWT_SECRET should be at least 32 characters in production');
    }

    if (!env.razorpayKeyId && !env.razorpayMock) {
      warnings.push('RAZORPAY_KEY_ID not set — billing checkout will fail (use RAZORPAY_MOCK=true for QA only)');
    }

    if (!env.geminiApiKey && !env.geminiMock) {
      warnings.push('GEMINI_API_KEY not set — AI generation will fail (use GEMINI_MOCK=true for QA only)');
    }

    if (!env.corsOrigins.length && !env.corsAllowAll) {
      warnings.push('CORS_ORIGIN not set — only same-origin browser requests will work');
    }
  }

  warnings.forEach((msg) => console.warn(`[vexora] Warning: ${msg}`));
  errors.forEach((msg) => console.error(`[vexora] Error: ${msg}`));

  if (errors.length > 0) {
    console.error('[vexora] Fix environment variables and restart. See .env.example and DEPLOYMENT-PRODUCTION.md');
    process.exit(1);
  }

  return { ok: true, warnings };
}

export default validateEnv;
