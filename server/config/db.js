import mongoose from 'mongoose';
import env from './env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongoUri);
  console.log(`[vexora] MongoDB connected: ${mongoose.connection.name}`);
}

export default connectDB;
