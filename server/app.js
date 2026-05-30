import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { createCorsMiddleware } from './config/cors.js';
import { errorHandler } from './utils/errors.js';
import env from './config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const app = express();

app.use(createCorsMiddleware());
app.use(express.json({ limit: '10kb' }));

app.use('/api/health', healthRoutes);

/** @deprecated Use GET /api/health/ready — kept for scripts and load balancers */
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'VEXORA API is running', health: '/api/health/ready' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/ai', aiRoutes);

app.use(express.static(rootDir));

if (env.isProduction && env.publicUrl) {
  app.get('/api/config', (req, res) => {
    res.json({
      success: true,
      apiBase: env.publicUrl,
      environment: env.nodeEnv,
    });
  });
}

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  next();
});

app.use(errorHandler);

export default app;
