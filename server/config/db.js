import mongoose from 'mongoose';
import env from './env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongoUri);
    console.log(`[vexora] MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('[vexora] MongoDB connection failed:', error.message);
    console.error('[vexora] Ensure MongoDB is running and MONGODB_URI is set in .env');
    throw error;
  }
}

export default connectDB;
