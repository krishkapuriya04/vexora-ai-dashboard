import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './utils/errors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'VEXORA API is running' });
});

app.use('/api/auth', authRoutes);

app.use(express.static(rootDir));

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  next();
});

app.use(errorHandler);

export default app;
