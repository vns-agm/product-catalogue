import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { CatalogueService } from '../src/catalogue/catalogueService';
import type { ProductSource } from '../src/catalogue/productSource';
import { EnquiryService } from '../src/enquiries/enquiryService';
import { UpstreamError } from '../src/http/errors';
import {
  InMemoryEnquiryRepository,
  InMemoryProductSource,
  RecordingEmailSender,
  silentLogger,
} from './fixtures';

/** Exercises the HTTP API end to end, with only the external boundaries faked. */
function setup(source: ProductSource = new InMemoryProductSource()) {
  const repository = new InMemoryEnquiryRepository();
  const email = new RecordingEmailSender();
  const catalogue = new CatalogueService(source, {
    featuredProductIds: ['5', '1', '4'],
    categoryTopRatedCount: 2,
    logger: silentLogger,
  });
  const enquiries = new EnquiryService({
    products: source,
    repository,
    email,
    salesInbox: 'sales@shop.test',
    logger: silentLogger,
  });
  const app = createApp({ catalogue, enquiries, logger: silentLogger });
  return { app, repository, email };
}

describe('GET /api/featured (home page)', () => {
  it('returns the chosen products in the chosen order', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/featured').expect(200);
    expect(res.body.products.map((p: { id: string }) => p.id)).toEqual(['5', '1', '4']);
  });

  it('does not leak product descriptions into summaries', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/featured');
    expect(res.body.products[0]).not.toHaveProperty('description');
  });
});

describe('GET /api/categories/:slug (category page)', () => {
  it('splits the category into top rated and more, best rated first', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/categories/electronics').expect(200);
    expect(res.body.category).toEqual({ slug: 'electronics', name: 'Electronics' });
    // 2 and 3 tie on 4.8; 2 has more reviews so ranks first.
    expect(res.body.topRated.map((p: { id: string }) => p.id)).toEqual(['2', '3']);
    expect(res.body.more.map((p: { id: string }) => p.id)).toEqual(['1', '4']);
  });

  it('only includes products from that category', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/categories/jewelery').expect(200);
    expect(res.body.topRated.map((p: { id: string }) => p.id)).toEqual(['5']);
    expect(res.body.more).toEqual([]);
  });

  it('returns 404 for an unknown category', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/categories/nope').expect(404);
    expect(res.body.error.code).toBe('not_found');
  });

  it('lists categories for navigation', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/categories').expect(200);
    expect(res.body.categories.map((c: { slug: string }) => c.slug)).toEqual(['electronics', 'jewelery']);
  });

  it('includes a product count and best-rated preview images for each category card', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/categories').expect(200);
    const [electronics, jewelery] = res.body.categories;
    expect(electronics.productCount).toBe(4);
    // Best rated first (ids 2, 3, 1), capped at three images.
    expect(electronics.previewImageUrls).toEqual([
      'https://example.com/2.png',
      'https://example.com/3.png',
      'https://example.com/1.png',
    ]);
    expect(jewelery).toMatchObject({ productCount: 1, previewImageUrls: ['https://example.com/5.png'] });
  });
});

describe('GET /api/search', () => {
  it('only returns products whose text matches the term, case-insensitively', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/search').query({ q: 'GAMING' }).expect(200);
    expect(res.body.products.map((p: { id: string }) => p.id)).toEqual(['2']);
  });

  it('matches the description as well as the title', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/search').query({ q: 'wide screen' }).expect(200);
    expect(res.body.products.map((p: { id: string }) => p.id)).toEqual(['4']);
  });

  it('returns an empty list when nothing matches', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/search').query({ q: 'zzz' }).expect(200);
    expect(res.body.products).toEqual([]);
  });

  it.each([[''], ['   '], ['x'.repeat(101)]])('rejects an invalid term %#', async (q) => {
    const { app } = setup();
    const res = await request(app).get('/api/search').query({ q }).expect(400);
    expect(res.body.error.fields.q).toBeDefined();
  });

  it('rejects a missing term', async () => {
    const { app } = setup();
    await request(app).get('/api/search').expect(400);
  });
});

describe('GET /api/products/:id (product page)', () => {
  it('returns full product details', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/products/4').expect(200);
    expect(res.body.product).toMatchObject({ id: '4', title: 'Monitor', description: 'Ultra wide screen' });
  });

  it('returns 404 for an unknown product', async () => {
    const { app } = setup();
    await request(app).get('/api/products/999').expect(404);
  });
});

describe('POST /api/enquiries', () => {
  const valid = {
    productId: '2',
    name: '  Ada Lovelace ',
    email: 'Ada@Example.com',
    message: 'Is this in stock?',
  };

  let ctx: ReturnType<typeof setup>;
  beforeEach(() => {
    ctx = setup();
  });

  it('stores the enquiry, emails the sales inbox and returns an id', async () => {
    const res = await request(ctx.app).post('/api/enquiries').send(valid).expect(201);

    const stored = ctx.repository.enquiries.get(res.body.enquiryId);
    expect(stored).toMatchObject({
      productId: '2',
      productTitle: 'Gaming drive',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      emailStatus: 'sent',
    });

    expect(ctx.email.sent).toHaveLength(1);
    expect(ctx.email.sent[0]).toMatchObject({ to: 'sales@shop.test', replyTo: 'ada@example.com' });
    expect(ctx.email.sent[0]!.text).toContain('Is this in stock?');
  });

  it('returns field errors for invalid input and sends nothing', async () => {
    const res = await request(ctx.app)
      .post('/api/enquiries')
      .send({ productId: '2', name: '', email: 'not-an-email', phone: 'call me' })
      .expect(400);
    expect(Object.keys(res.body.error.fields).sort()).toEqual(['email', 'name', 'phone']);
    expect(ctx.email.sent).toHaveLength(0);
    expect(ctx.repository.enquiries.size).toBe(0);
  });

  it('rejects an enquiry for a product that does not exist', async () => {
    const res = await request(ctx.app)
      .post('/api/enquiries')
      .send({ ...valid, productId: '999' })
      .expect(400);
    expect(res.body.error.fields.productId).toBeDefined();
    expect(ctx.email.sent).toHaveLength(0);
  });

  it('still thanks the customer and keeps the lead if the email provider fails', async () => {
    ctx.email.failWith = new Error('SMTP down');
    const res = await request(ctx.app).post('/api/enquiries').send(valid).expect(201);
    expect(ctx.repository.enquiries.get(res.body.enquiryId)?.emailStatus).toBe('failed');
  });

  it('silently drops submissions that fill the honeypot', async () => {
    await request(ctx.app)
      .post('/api/enquiries')
      .send({ ...valid, company: 'Spam Inc' })
      .expect(201);
    expect(ctx.email.sent).toHaveLength(0);
    expect(ctx.repository.enquiries.size).toBe(0);
  });

  it('rejects malformed JSON with a 400, not a 500', async () => {
    await request(ctx.app)
      .post('/api/enquiries')
      .set('content-type', 'application/json')
      .send('{"name":')
      .expect(400);
  });

  it('rate limits repeated submissions', async () => {
    for (let i = 0; i < 5; i++) await request(ctx.app).post('/api/enquiries').send(valid).expect(201);
    const res = await request(ctx.app).post('/api/enquiries').send(valid).expect(429);
    expect(res.body.error.code).toBe('rate_limited');
  });
});

describe('error handling', () => {
  it('hides upstream failure details behind a 502', async () => {
    const failing = new InMemoryProductSource();
    failing.getProducts = async () => {
      throw new UpstreamError('fakestoreapi.com returned HTTP 503');
    };
    const { app } = setup(failing);
    const res = await request(app).get('/api/featured').expect(502);
    expect(res.body.error.code).toBe('upstream_unavailable');
    expect(res.body.error.message).not.toContain('fakestoreapi');
  });

  it('turns unexpected errors into a generic 500', async () => {
    const broken = new InMemoryProductSource();
    broken.search = async () => {
      throw new TypeError('boom');
    };
    const { app } = setup(broken);
    const res = await request(app).get('/api/search?q=a').expect(500);
    expect(res.body.error).toEqual({ code: 'internal_error', message: 'Something went wrong' });
  });

  it('returns JSON 404 for unknown API routes', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/nope').expect(404);
    expect(res.body.error.code).toBe('not_found');
  });
});
