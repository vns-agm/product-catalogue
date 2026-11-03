import type {
  CategoriesResponse,
  CategoryPageResponse,
  EnquiryResponse,
  FeaturedResponse,
  ProductResponse,
  SearchResponse,
} from '@catalogue/contracts';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import type { CatalogueService } from '../catalogue/catalogueService';
import { enquirySchema } from '../enquiries/enquirySchema';
import type { EnquiryService } from '../enquiries/enquiryService';
import { ValidationError } from './errors';

const searchQuerySchema = z.object({
  q: z
    .string({ required_error: 'Enter a search term' })
    .trim()
    .min(1, 'Enter a search term')
    .max(100, 'Search term is too long'),
});

function parse<T extends z.ZodTypeAny>(schema: T, value: unknown): z.output<T> {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_';
    fields[key] ??= issue.message;
  }
  throw new ValidationError('Request is invalid', fields);
}

/** Short CDN/browser caching for read endpoints; product data changes rarely. */
const cacheable = 'public, max-age=60, s-maxage=300, stale-while-revalidate=600';

export function createRoutes(catalogue: CatalogueService, enquiries: EnquiryService): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  router.get('/featured', async (_req, res) => {
    const body: FeaturedResponse = { products: await catalogue.getFeatured() };
    res.set('Cache-Control', cacheable).json(body);
  });

  router.get('/categories', async (_req, res) => {
    const body: CategoriesResponse = { categories: await catalogue.listCategories() };
    res.set('Cache-Control', cacheable).json(body);
  });

  router.get('/categories/:slug', async (req, res) => {
    const body: CategoryPageResponse = await catalogue.getCategoryPage(req.params.slug);
    res.set('Cache-Control', cacheable).json(body);
  });

  router.get('/search', async (req, res) => {
    const { q } = parse(searchQuerySchema, req.query);
    const body: SearchResponse = { query: q, products: await catalogue.search(q) };
    res.set('Cache-Control', cacheable).json(body);
  });

  router.get('/products/:id', async (req, res) => {
    const body: ProductResponse = { product: await catalogue.getProduct(req.params.id) };
    res.set('Cache-Control', cacheable).json(body);
  });

  router.post(
    '/enquiries',
    // In-memory, per-instance limit: a basic guard, not a distributed one (see DECISIONS.md).
    rateLimit({ windowMs: 60_000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false,
      handler: (_req, res) => {
        res.status(429).json({
          error: { code: 'rate_limited', message: 'Too many enquiries. Please try again in a minute.' },
        });
      },
    }),
    async (req, res) => {
      const input = parse(enquirySchema, req.body);
      const body: EnquiryResponse = await enquiries.submit(input);
      res.status(201).json(body);
    },
  );

  return router;
}
