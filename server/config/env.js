import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

function parseCorsOrigins(value) {
  if (!value || value.trim() === '') return [];
  if (value.trim() === '*') return [];
  return value.split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean);
}

const corsOriginRaw = process.env.CORS_ORIGIN || '';
const corsAllowAll = corsOriginRaw.trim() === '*';
const corsOrigins = parseCorsOrigins(corsOriginRaw);

const env = {
  port: Number(process.env.PORT) || 5000,
  host: process.env.HOST || '0.0.0.0',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vexora',
  jwtSecret: process.env.JWT_SECRET || 'vexora-dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRememberExpiresIn: process.env.JWT_REMEMBER_EXPIRES_IN || '30d',
  nodeEnv,
  isProduction,
  publicUrl: (process.env.VEXORA_PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || '').replace(/\/$/, ''),
  corsOrigins,
  corsAllowAll,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayMock: process.env.RAZORPAY_MOCK === 'true',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  geminiMock: process.env.GEMINI_MOCK === 'true',
};

export default env;
