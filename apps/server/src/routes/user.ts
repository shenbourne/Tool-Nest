import { Router } from 'express';

export const userRouter = Router();

// Placeholder for user preferences API
userRouter.get('/preferences', (_req, res) => {
  res.json({
    success: true,
    data: {
      version: 1,
      language: 'zh',
      theme: 'system',
      favorites: [],
      recentTools: [],
      settings: {},
    },
  });
});
