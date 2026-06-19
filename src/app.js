import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import analyticsRoutes from './routes/analytics.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isDev = process.env.NODE_ENV !== 'production';

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

app.use('/api/analytics', analyticsRoutes);

if (!isDev) {
  app.use(express.static(path.join(__dirname, '../public')));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(__dirname, '../public', 'index.html'));
    }
    next();
  });
}

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Internal server error',
  });
});

export default app;