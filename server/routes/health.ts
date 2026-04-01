// server/routes/health.ts
import { Router } from 'express';
import type { ApiResponse } from '../../shared/types/index.js';

export const healthRoutes = Router();

healthRoutes.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'dbest.app',
      version: '0.1.0',
      status: 'healthy',
      demoMode: process.env.USE_DEMO_MODE === 'true',
      timestamp: new Date().toISOString(),
    },
  } satisfies ApiResponse);
});
