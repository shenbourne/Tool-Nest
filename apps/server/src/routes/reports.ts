import { Router } from 'express';
import { reportRepo } from '../storage/store.js';
import { AppError } from '../middleware/error-handler.js';
import { sanitizeHtml } from '../middleware/security.js';
import type { ApiResponse, ShareReport } from '@toolnest/shared';

export const reportsRouter = Router();

// Create a new report
reportsRouter.post('/', async (req, res, next) => {
  try {
    const { content, title } = req.body ?? {};

    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Report content is required and must be a non-empty string');
    }

    if (title !== undefined && typeof title !== 'string') {
      throw new AppError(400, 'VALIDATION_ERROR', 'Report title must be a string');
    }

    const report = await reportRepo.create(sanitizeHtml(content), title ? sanitizeHtml(title) : undefined);

    const response: ApiResponse<ShareReport> = {
      success: true,
      data: report,
    };
    res.status(201).json(response);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    if (err instanceof Error && err.message.includes('Maximum number')) {
      return next(new AppError(409, 'LIMIT_REACHED', err.message));
    }
    if (err instanceof Error && err.message.includes('exceeds maximum')) {
      return next(new AppError(413, 'CONTENT_TOO_LARGE', err.message));
    }
    next(err);
  }
});

// Get a report by ID
reportsRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !/^[a-f0-9]+$/i.test(id)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid report ID format');
    }

    const report = await reportRepo.get(id);

    if (!report) {
      throw new AppError(404, 'NOT_FOUND', 'Report not found or has expired');
    }

    const response: ApiResponse<ShareReport> = {
      success: true,
      data: report,
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});
