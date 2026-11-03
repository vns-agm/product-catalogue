import { z } from 'zod';

const csv = (fallback: string) =>
  z
    .string()
    .default(fallback)
    .transform((value) =>
      value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean),
    );

const configSchema = z
  .object({
    API_PORT: z.coerce.number().int().positive().default(3001),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    /** Only needed when the web app is served from a different origin than the API. */
    CORS_ORIGIN: z.string().optional(),

    /**
     * Where product data comes from. `fakestore-snapshot` serves a committed copy
     * of the same data, for hosts whose IPs Fake Store blocks (e.g. Vercel).
     */
    PRODUCT_SOURCE: z.enum(['fakestore-api', 'fakestore-snapshot']).default('fakestore-api'),
    FAKESTORE_BASE_URL: z.string().url().default('https://fakestoreapi.com'),
    PRODUCT_CACHE_TTL_SECONDS: z.coerce.number().int().nonnegative().default(300),
    UPSTREAM_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),

    /** The entrepreneur's hand-picked "top rated" products for the home page, in display order. */
    FEATURED_PRODUCT_IDS: csv('3,5,12,18,19'),
    /** How many of a category's products are shown in its "top rated" section. */
    CATEGORY_TOP_RATED_COUNT: z.coerce.number().int().positive().default(3),

    DATABASE_URL: z.string().default('file:data/local.db'),
    DATABASE_AUTH_TOKEN: z.string().optional(),

    EMAIL_PROVIDER: z.enum(['console', 'smtp']).default('console'),
    EMAIL_FROM: z.string().default('Catalogue <no-reply@example.com>'),
    SALES_INBOX_EMAIL: z.string().email().default('sales@example.com'),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
  })
  .superRefine((config, ctx) => {
    if (config.EMAIL_PROVIDER === 'smtp' && !config.SMTP_HOST) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SMTP_HOST'],
        message: 'SMTP_HOST is required when EMAIL_PROVIDER=smtp',
      });
    }
  });

export type Config = z.infer<typeof configSchema>;

/** Parses and validates configuration once, failing fast with a readable message. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  // Treat empty strings (common in copied .env files) as "not set" so defaults apply.
  const cleaned = Object.fromEntries(Object.entries(env).filter(([, value]) => value !== ''));
  const result = configSchema.safeParse(cleaned);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid configuration:\n${details}`);
  }
  return result.data;
}
