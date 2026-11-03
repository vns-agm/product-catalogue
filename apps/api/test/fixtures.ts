import type { Product } from '@catalogue/contracts';
import { matchesSearch, type ProductSource } from '../src/catalogue/productSource';
import type { EmailMessage, EmailSender } from '../src/email/emailSender';
import type { EmailStatus, Enquiry, EnquiryRepository } from '../src/enquiries/enquiryRepository';

export function product(overrides: Partial<Product> & { id: string }): Product {
  return {
    title: `Product ${overrides.id}`,
    description: 'A product',
    price: { amount: 10, currency: 'USD' },
    imageUrl: 'https://example.com/image.png',
    category: { slug: 'electronics', name: 'Electronics' },
    rating: { average: 3, count: 10 },
    ...overrides,
  };
}

export const jewelery = { slug: 'jewelery', name: 'Jewelery' };

export const sampleProducts: Product[] = [
  product({ id: '1', title: 'Laptop backpack', rating: { average: 3.9, count: 120 } }),
  product({ id: '2', title: 'Gaming drive', rating: { average: 4.8, count: 400 } }),
  product({ id: '3', title: 'SSD', rating: { average: 4.8, count: 319 } }),
  product({ id: '4', title: 'Monitor', description: 'Ultra wide screen', rating: { average: 2.2, count: 140 } }),
  product({ id: '5', title: 'Gold ring', category: jewelery, rating: { average: 4.6, count: 400 } }),
];

/** In-memory ProductSource for tests. */
export class InMemoryProductSource implements ProductSource {
  constructor(private readonly products: Product[] = sampleProducts) {}

  async listCategories() {
    return [...new Map(this.products.map((p) => [p.category.slug, p.category])).values()];
  }
  async listProductsInCategory(slug: string) {
    return this.products.filter((p) => p.category.slug === slug);
  }
  async getProduct(id: string) {
    return this.products.find((p) => p.id === id) ?? null;
  }
  async getProducts(ids: string[]) {
    return ids.flatMap((id) => this.products.find((p) => p.id === id) ?? []);
  }
  async search(query: string) {
    return this.products.filter((p) => matchesSearch(p, query));
  }
}

export class InMemoryEnquiryRepository implements EnquiryRepository {
  readonly enquiries = new Map<string, Enquiry>();

  async create(enquiry: Enquiry) {
    this.enquiries.set(enquiry.id, { ...enquiry });
  }
  async setEmailStatus(id: string, status: EmailStatus) {
    const enquiry = this.enquiries.get(id);
    if (enquiry) enquiry.emailStatus = status;
  }
}

export class RecordingEmailSender implements EmailSender {
  readonly sent: EmailMessage[] = [];
  failWith: Error | null = null;

  async send(message: EmailMessage) {
    if (this.failWith) throw this.failWith;
    this.sent.push(message);
  }
}

export const silentLogger = { info() {}, warn() {}, error() {} };
