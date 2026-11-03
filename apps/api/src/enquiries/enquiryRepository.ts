import type { Client } from '@libsql/client';

export type EmailStatus = 'pending' | 'sent' | 'failed';

export interface Enquiry {
  id: string;
  productId: string;
  productTitle: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  createdAt: string;
  emailStatus: EmailStatus;
}

/**
 * Enquiries are persisted before the email is sent so that a lead is never
 * lost if the email provider is down. `emailStatus` makes failed sends
 * visible and retryable.
 */
export interface EnquiryRepository {
  create(enquiry: Enquiry): Promise<void>;
  setEmailStatus(id: string, status: EmailStatus): Promise<void>;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS enquiries (
    id            TEXT PRIMARY KEY,
    product_id    TEXT NOT NULL,
    product_title TEXT NOT NULL,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL,
    phone         TEXT,
    message       TEXT,
    created_at    TEXT NOT NULL,
    email_status  TEXT NOT NULL CHECK (email_status IN ('pending', 'sent', 'failed'))
  )`;

/** libSQL works against a local SQLite file in development and Turso in production. */
export class LibsqlEnquiryRepository implements EnquiryRepository {
  private ready: Promise<unknown> | null = null;

  constructor(private readonly db: Client) {}

  async create(enquiry: Enquiry): Promise<void> {
    await this.ensureSchema();
    await this.db.execute({
      sql: `INSERT INTO enquiries
              (id, product_id, product_title, name, email, phone, message, created_at, email_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        enquiry.id,
        enquiry.productId,
        enquiry.productTitle,
        enquiry.name,
        enquiry.email,
        enquiry.phone ?? null,
        enquiry.message ?? null,
        enquiry.createdAt,
        enquiry.emailStatus,
      ],
    });
  }

  async setEmailStatus(id: string, status: EmailStatus): Promise<void> {
    await this.ensureSchema();
    await this.db.execute({
      sql: 'UPDATE enquiries SET email_status = ? WHERE id = ?',
      args: [status, id],
    });
  }

  /**
   * Idempotent, lazily-run schema setup. Good enough for one table; a real
   * migration tool replaces this as soon as the schema needs to change.
   */
  private ensureSchema(): Promise<unknown> {
    this.ready ??= this.db.execute(SCHEMA).catch((error: unknown) => {
      this.ready = null;
      throw error;
    });
    return this.ready;
  }
}
