import { Router } from 'express';
import { getUserPreferences, saveUserPreferences } from '../storage/store.js';
import { AppError } from '../middleware/error-handler.js';
import type { ApiResponse, UserPreferences } from '@toolnest/shared';

export const userRouter = Router();

// Get user preferences
userRouter.get('/preferences', async (_req, res, next) => {
  try {
    const prefs = await getUserPreferences();
    const response: ApiResponse<UserPreferences> = {
      success: true,
      data: prefs,
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// Update user preferences
userRouter.put('/preferences', async (req, res, next) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      throw new AppError(400, 'VALIDATION_ERROR', 'Request body must be a JSON object');
    }

    // Validate fields if present
    if (body.language !== undefined && typeof body.language !== 'string') {
      throw new AppError(400, 'VALIDATION_ERROR', 'language must be a string');
    }
    if (body.theme !== undefined && !['light', 'dark', 'system'].includes(body.theme)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'theme must be one of: light, dark, system');
    }
    if (body.favorites !== undefined) {
      if (!Array.isArray(body.favorites) || !body.favorites.every((f: unknown) => typeof f === 'string')) {
        throw new AppError(400, 'VALIDATION_ERROR', 'favorites must be an array of strings');
      }
    }
    if (body.recentTools !== undefined) {
      if (!Array.isArray(body.recentTools)) {
        throw new AppError(400, 'VALIDATION_ERROR', 'recentTools must be an array');
      }
    }

    const prefs = await saveUserPreferences(body);
    const response: ApiResponse<UserPreferences> = {
      success: true,
      data: prefs,
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});
