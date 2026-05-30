import dotenv from 'dotenv';

dotenv.config();

const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vexora',
  jwtSecret: process.env.JWT_SECRET || 'vexora-dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRememberExpiresIn: process.env.JWT_REMEMBER_EXPIRES_IN || '30d',
  nodeEnv: process.env.NODE_ENV || 'development',
};

if (env.nodeEnv === 'production' && env.jwtSecret === 'vexora-dev-secret-change-in-production') {
  console.warn('[vexora] Warning: set JWT_SECRET in production.');
}

export default env;
