import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { logger } from './lib/logger';
import { authMiddleware } from './middleware/auth';
import { localeMiddleware } from './middleware/locale';
import projectsRouter from './routes/projects';
import uploadRouter from './routes/upload';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Global Middleware ───
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(localeMiddleware);

// ─── Health Check ───
app.get('/api/health', async (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      demoMode: process.env.USE_DEMO_MODE === 'true',
    },
  });
});

// ─── API Routes ───
app.use('/api/projects', authMiddleware, projectsRouter);
app.use('/api/upload', authMiddleware, uploadRouter);

// ─── Error Handler ───
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: 'An internal error occurred. Please try again later.',
  });
});

// ─── Start Server ───
app.listen(PORT, () => {
  logger.info(`dbest.app server running on port ${PORT}`, {
    demoMode: process.env.USE_DEMO_MODE === 'true',
  });
});

export default app;
