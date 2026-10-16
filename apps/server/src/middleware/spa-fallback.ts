import type { NextFunction, Request, Response } from 'express';

/**
 * Sends browser navigation requests to the SPA entry point while leaving the
 * API namespace to the JSON not-found handler.
 */
export function spaFallback(indexFile: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.path === '/api' || req.path.startsWith('/api/')) {
      next();
      return;
    }
    res.sendFile(indexFile);
  };
}
