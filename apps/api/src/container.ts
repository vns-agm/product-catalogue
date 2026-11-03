import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createClient } from '@libsql/client';
import { createApp } from './app';
import { CatalogueService } from './catalogue/catalogueService';
import { FakeStoreProductSource, FakeStoreSnapshotSource } from './catalogue/fakeStoreSource';
import type { ProductSource } from './catalogue/productSource';
import type { Config } from './config';
import { ConsoleEmailSender, type EmailSender, SmtpEmailSender } from './email/emailSender';
import { LibsqlEnquiryRepository } from './enquiries/enquiryRepository';
import { EnquiryService } from './enquiries/enquiryService';

/**
 * Composition root: the one place that picks concrete implementations.
 * Changing the product source, database or email provider happens here.
 */
export function buildApp(config: Config) {
  const products = buildProductSource(config);

  const catalogue = new CatalogueService(products, {
    featuredProductIds: config.FEATURED_PRODUCT_IDS,
    categoryTopRatedCount: config.CATEGORY_TOP_RATED_COUNT,
  });

  if (config.DATABASE_URL.startsWith('file:')) {
    mkdirSync(dirname(config.DATABASE_URL.slice('file:'.length)), { recursive: true });
  }
  const db = createClient({ url: config.DATABASE_URL, authToken: config.DATABASE_AUTH_TOKEN });

  const enquiries = new EnquiryService({
    products,
    repository: new LibsqlEnquiryRepository(db),
    email: buildEmailSender(config),
    salesInbox: config.SALES_INBOX_EMAIL,
  });

  return createApp({ catalogue, enquiries, corsOrigin: config.CORS_ORIGIN });
}

function buildProductSource(config: Config): ProductSource {
  switch (config.PRODUCT_SOURCE) {
    case 'fakestore-api':
      return new FakeStoreProductSource({
        baseUrl: config.FAKESTORE_BASE_URL,
        timeoutMs: config.UPSTREAM_TIMEOUT_MS,
        cacheTtlMs: config.PRODUCT_CACHE_TTL_SECONDS * 1000,
      });
    case 'fakestore-snapshot':
      return new FakeStoreSnapshotSource();
  }
}

function buildEmailSender(config: Config): EmailSender {
  switch (config.EMAIL_PROVIDER) {
    case 'smtp':
      return new SmtpEmailSender({
        host: config.SMTP_HOST!,
        port: config.SMTP_PORT,
        secure: config.SMTP_SECURE,
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
        from: config.EMAIL_FROM,
      });
    case 'console':
      return new ConsoleEmailSender(config.EMAIL_FROM);
  }
}
