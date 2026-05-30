import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';

async function start() {
  try {
    await connectDB();

    app.listen(env.port, () => {
      console.log(`[vexora] Server running on http://localhost:${env.port}`);
      console.log(`[vexora] API: http://localhost:${env.port}/api/auth`);
    });
  } catch (error) {
    console.error('[vexora] Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
