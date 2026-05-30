import { Router } from 'express';
import mongoose from 'mongoose';
import env from '../config/env.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'vexora-api',
    status: 'ok',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

router.get('/ready', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;

  if (!dbReady) {
    return res.status(503).json({
      success: false,
      status: 'not_ready',
      database: 'disconnected',
      message: 'MongoDB is not connected',
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    status: 'ready',
    database: 'connected',
    databaseName: mongoose.connection.name,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

router.get('/live', (req, res) => {
  res.status(200).send('OK');
});

export default router;
