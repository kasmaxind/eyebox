import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../utils/errors';

function sanitizeString(value: string): string {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  const sanitize = (obj: Record<string, unknown>): void => {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'string') {
        obj[key] = sanitizeString(val);
      } else if (val && typeof val === 'object' && !Array.isArray(val)) {
        sanitize(val as Record<string, unknown>);
      } else if (Array.isArray(val)) {
        val.forEach((item, i) => {
          if (typeof item === 'string') val[i] = sanitizeString(item);
          else if (item && typeof item === 'object') sanitize(item as Record<string, unknown>);
        });
      }
    }
  };

  if (req.body && typeof req.body === 'object') {
    sanitize(req.body);
  }
  next();
}

export function validate(chains: ValidationChain[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(chains.map((chain) => chain.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors.array().map((e) => e.msg).join(', ');
      next(new ValidationError(message));
      return;
    }
    next();
  };
}
