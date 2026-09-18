import { Router } from 'express';
import dns from 'node:dns';
import { promisify } from 'node:util';
import { AppError } from '../middleware/error-handler.js';
import { GlobalpingService } from '../services/globalping.js';
import { OoniService } from '../services/ooni.js';
import type { ApiResponse } from '@toolnest/shared';
import { isValidDomain } from '@toolnest/shared';

export const networkRouter = Router();

interface NetworkRequestBody {
  target?: string;
  locations?: Array<{ type: string; magic: string; limit: number }>;
}

function validateTarget(target: unknown): string {
  if (typeof target !== 'string' || target.trim().length === 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Target is required');
  }
  const cleaned = target.trim();
  if (!isValidDomain(cleaned) && !/^\d{1,3}(\.\d{1,3}){3}$/.test(cleaned)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Target must be a valid domain or IP address');
  }
  return cleaned;
}

const DEFAULT_LOCATIONS = [{ type: 'country' as const, magic: 'US', limit: 2 }];

networkRouter.post('/ping', async (req, res, next) => {
  try {
    const target = validateTarget(req.body?.target);
    const locations = req.body?.locations ?? DEFAULT_LOCATIONS;

    const result = await GlobalpingService.createAndPoll(
      { type: 'ping', target, locations },
      { pollIntervalMs: 500, maxPolls: 60 },
    );

    const response: ApiResponse = { success: true, data: result };
    res.json(response);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(err);
  }
});

networkRouter.post('/mtr', async (req, res, next) => {
  try {
    const target = validateTarget(req.body?.target);
    const locations = req.body?.locations ?? DEFAULT_LOCATIONS;

    const result = await GlobalpingService.createAndPoll(
      { type: 'mtr', target, locations },
      { pollIntervalMs: 1000, maxPolls: 60 },
    );

    const response: ApiResponse = { success: true, data: result };
    res.json(response);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(err);
  }
});

networkRouter.post('/latency', async (req, res, next) => {
  try {
    const target = validateTarget(req.body?.target);
    const locations = req.body?.locations ?? DEFAULT_LOCATIONS;

    const result = await GlobalpingService.createAndPoll(
      { type: 'dns', target, locations },
      { pollIntervalMs: 500, maxPolls: 60 },
    );

    const response: ApiResponse = { success: true, data: result };
    res.json(response);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(err);
  }
});

const dnsResolve = promisify(dns.resolve);

networkRouter.post('/dns-leak', async (req, res, next) => {
  try {
    const { domains } = req.body ?? {};

    if (!Array.isArray(domains) || domains.length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'At least one domain is required');
    }

    const results = await Promise.all(
      domains.map(async (domain: string) => {
        try {
          const addresses = await dnsResolve(domain);
          return { domain, resolved: true, addresses };
        } catch {
          return { domain, resolved: false, addresses: [] };
        }
      }),
    );

    const response: ApiResponse = { success: true, data: results };
    res.json(response);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(err);
  }
});

networkRouter.post('/rule-test', async (req, res, next) => {
  try {
    const { domain, dnsServer } = req.body ?? {};

    if (typeof domain !== 'string' || domain.trim().length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Domain is required');
    }

    const resolver = new dns.Resolver();
    if (typeof dnsServer === 'string' && dnsServer.trim()) {
      resolver.setServers([dnsServer]);
    }

    const resolveAsync = promisify(resolver.resolve4.bind(resolver));
    const addresses = await resolveAsync(domain.trim());

    const response: ApiResponse = { success: true, data: { domain: domain.trim(), addresses } };
    res.json(response);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(err);
  }
});

networkRouter.post('/censorship', async (req, res, next) => {
  try {
    const { urls } = req.body ?? {};

    if (!Array.isArray(urls) || urls.length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'At least one URL is required');
    }

    const results = await OoniService.checkCensorship(urls);

    const response: ApiResponse = { success: true, data: results };
    res.json(response);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(err);
  }
});
