import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  locale?: string;
}

/**
 * Auth middleware stub.
 * In demo mode (USE_DEMO_MODE=true), passes through with a demo user ID.
 * In production, checks for a valid Authorization header.
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const isDemoMode = process.env.USE_DEMO_MODE === 'true';

  if (isDemoMode) {
    req.userId = 'demo-user-001';
    logger.debug('Demo mode: bypassing auth, using demo-user-001');
    next();
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      error: 'Authorization header is required',
    });
    return;
  }

  // TODO: Validate JWT token and extract user ID
  // For now, extract a placeholder user ID from the token
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Invalid authorization token',
    });
    return;
  }

  // Placeholder: in production, decode and verify JWT here
  req.userId = 'placeholder-user-id';
  logger.debug('Auth middleware: token accepted (placeholder validation)');

  next();
}
