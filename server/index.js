import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';
import { validateEnv } from './config/validateEnv.js';

async function start() {
  try {
    validateEnv();
    await connectDB();

    app.listen(env.port, env.host, () => {
      const base = env.publicUrl || `http://localhost:${env.port}`;
      console.log(`[vexora] Server running (${env.nodeEnv})`);
      console.log(`[vexora] Listening on ${env.host}:${env.port}`);
      console.log(`[vexora] App URL: ${base}`);
      console.log(`[vexora] Health: ${base}/api/health/ready`);
      console.log(`[vexora] API: ${base}/api/auth`);
    });
  } catch (error) {
    console.error('[vexora] Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
