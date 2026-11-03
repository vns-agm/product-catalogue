import type { ApiError } from '@catalogue/contracts';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import type { CatalogueService } from './catalogue/catalogueService';
import type { EnquiryService } from './enquiries/enquiryService';
import { AppError } from './http/errors';
import { createRoutes } from './http/routes';

export interface AppDeps {
  catalogue: CatalogueService;
  enquiries: EnquiryService;
  corsOrigin?: string;
  logger?: Pick<Console, 'error'>;
}

/** Builds the HTTP app from already-constructed services, so tests can inject fakes. */
export function createApp({ catalogue, enquiries, corsOrigin, logger = console }: AppDeps) {
  const app = express();

  // Behind Vercel / a load balancer: trust the first proxy for client IPs (rate limiting).
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '10kb' }));

  if (corsOrigin) {
    app.use((req, res, next) => {
      res.set('Access-Control-Allow-Origin', corsOrigin);
      res.set('Vary', 'Origin');
      if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET,POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.sendStatus(204);
        return;
      }
      next();
    });
  }

  app.use('/api', createRoutes(catalogue, enquiries));

  app.use('/api', (_req, res) => {
    const body: ApiError = { error: { code: 'not_found', message: 'Route not found' } };
    res.status(404).json(body);
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
      if (!err.expose) logger.error(err, err.cause);
      const body: ApiError = {
        error: {
          code: err.code,
          message: err.expose ? err.message : 'Products are temporarily unavailable. Please try again.',
          ...('fields' in err && err.fields ? { fields: err.fields as Record<string, string> } : {}),
        },
      };
      res.status(err.status).json(body);
      return;
    }
    // Malformed JSON bodies from express.json()
    if (err?.type === 'entity.parse.failed' || err?.type === 'entity.too.large') {
      const body: ApiError = { error: { code: 'bad_request', message: 'Request body is invalid' } };
      res.status(err.status ?? 400).json(body);
      return;
    }
    logger.error(err);
    const body: ApiError = { error: { code: 'internal_error', message: 'Something went wrong' } };
    res.status(500).json(body);
  };
  app.use(errorHandler);

  return app;
}
