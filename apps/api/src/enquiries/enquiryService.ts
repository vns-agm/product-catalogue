import { randomUUID } from 'node:crypto';
import type { ProductSource } from '../catalogue/productSource';
import type { EmailSender } from '../email/emailSender';
import { buildSalesEnquiryEmail } from '../email/enquiryEmail';
import { ValidationError } from '../http/errors';
import type { Enquiry, EnquiryRepository } from './enquiryRepository';
import type { EnquiryInput } from './enquirySchema';

interface EnquiryServiceDeps {
  products: ProductSource;
  repository: EnquiryRepository;
  email: EmailSender;
  salesInbox: string;
  logger?: Pick<Console, 'error' | 'warn'>;
  newId?: () => string;
  now?: () => Date;
}

export class EnquiryService {
  private readonly logger: Pick<Console, 'error' | 'warn'>;
  private readonly newId: () => string;
  private readonly now: () => Date;

  constructor(private readonly deps: EnquiryServiceDeps) {
    this.logger = deps.logger ?? console;
    this.newId = deps.newId ?? randomUUID;
    this.now = deps.now ?? (() => new Date());
  }

  /**
   * Store the enquiry, then email the sales inbox.
   *
   * If the email fails the enquiry is still stored (marked `failed`) and the
   * customer still gets a thank-you: the lead is captured and can be re-sent,
   * whereas an error would just make them give up.
   */
  async submit(input: EnquiryInput): Promise<{ enquiryId: string }> {
    if (input.company) {
      // Honeypot tripped: pretend success so bots learn nothing, but don't store or send.
      this.logger.warn('Discarded enquiry that filled the honeypot field');
      return { enquiryId: this.newId() };
    }

    const product = await this.deps.products.getProduct(input.productId);
    if (!product) {
      throw new ValidationError('Unknown product', { productId: 'This product no longer exists' });
    }

    const enquiry: Enquiry = {
      id: this.newId(),
      productId: product.id,
      productTitle: product.title,
      name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.message,
      createdAt: this.now().toISOString(),
      emailStatus: 'pending',
    };
    await this.deps.repository.create(enquiry);

    try {
      await this.deps.email.send(buildSalesEnquiryEmail(enquiry, this.deps.salesInbox));
      await this.deps.repository.setEmailStatus(enquiry.id, 'sent');
    } catch (error) {
      this.logger.error(`Failed to email enquiry ${enquiry.id}`, error);
      await this.deps.repository.setEmailStatus(enquiry.id, 'failed').catch(() => undefined);
    }

    return { enquiryId: enquiry.id };
  }
}
