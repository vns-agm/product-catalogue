import { createClient } from '@libsql/client';
import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config';
import { buildSalesEnquiryEmail } from '../src/email/enquiryEmail';
import { type Enquiry, LibsqlEnquiryRepository } from '../src/enquiries/enquiryRepository';

const enquiry: Enquiry = {
  id: 'e-1',
  productId: '2',
  productTitle: 'Gaming drive',
  name: 'Ada <script>alert(1)</script>',
  email: 'ada@example.com',
  message: 'Line one\nLine two',
  createdAt: '2026-01-01T00:00:00.000Z',
  emailStatus: 'pending',
};

describe('buildSalesEnquiryEmail', () => {
  it('addresses the sales inbox and lets sales reply straight to the customer', () => {
    const email = buildSalesEnquiryEmail(enquiry, 'sales@shop.test');
    expect(email.to).toBe('sales@shop.test');
    expect(email.replyTo).toBe('ada@example.com');
    expect(email.text).toContain('Gaming drive');
  });

  it('escapes customer input in the HTML body', () => {
    const { html } = buildSalesEnquiryEmail(enquiry, 'sales@shop.test');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('keeps the subject on a single line', () => {
    const { subject } = buildSalesEnquiryEmail({ ...enquiry, name: 'Ada\r\nBcc: x@evil.test' }, 's@x.test');
    expect(subject).not.toMatch(/[\r\n]/);
  });
});

describe('LibsqlEnquiryRepository', () => {
  it('creates the schema on first use and persists enquiries', async () => {
    const db = createClient({ url: ':memory:' });
    const repository = new LibsqlEnquiryRepository(db);

    await repository.create(enquiry);
    await repository.setEmailStatus('e-1', 'sent');

    const { rows } = await db.execute('SELECT id, name, phone, email_status FROM enquiries');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: 'e-1', name: enquiry.name, phone: null, email_status: 'sent' });
  });
});

describe('loadConfig', () => {
  it('works with no environment at all', () => {
    const config = loadConfig({});
    expect(config.FEATURED_PRODUCT_IDS).toHaveLength(5);
    expect(config.EMAIL_PROVIDER).toBe('console');
  });

  it('treats empty strings as unset', () => {
    expect(loadConfig({ SMTP_HOST: '', CORS_ORIGIN: '' }).CORS_ORIGIN).toBeUndefined();
  });

  it('requires SMTP_HOST when sending via SMTP', () => {
    expect(() => loadConfig({ EMAIL_PROVIDER: 'smtp' })).toThrow(/SMTP_HOST/);
  });

  it('parses the featured product list', () => {
    expect(loadConfig({ FEATURED_PRODUCT_IDS: ' 7, 8 ,,9 ' }).FEATURED_PRODUCT_IDS).toEqual(['7', '8', '9']);
  });
});
