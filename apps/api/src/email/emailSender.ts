import nodemailer from 'nodemailer';

export interface EmailMessage {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
}

/** The boundary to the email provider. Swap implementations in `container.ts`. */
export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

/** Development default: prints the email instead of sending it, so no account is needed. */
export class ConsoleEmailSender implements EmailSender {
  constructor(
    private readonly from: string,
    private readonly logger: Pick<Console, 'info'> = console,
  ) {}

  async send(message: EmailMessage): Promise<void> {
    this.logger.info(
      [
        '──── email (EMAIL_PROVIDER=console, not actually sent) ────',
        `From:     ${this.from}`,
        `To:       ${message.to}`,
        `Reply-To: ${message.replyTo ?? '-'}`,
        `Subject:  ${message.subject}`,
        '',
        message.text,
        '────────────────────────────────────────────────────────────',
      ].join('\n'),
    );
  }
}

interface SmtpOptions {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
}

/**
 * Works with any SMTP server: Amazon SES, Mailgun, SendGrid, Gmail, or a
 * local catcher such as Mailpit.
 */
export class SmtpEmailSender implements EmailSender {
  private readonly transport: nodemailer.Transporter;

  constructor(private readonly options: SmtpOptions) {
    this.transport = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure,
      auth: options.user ? { user: options.user, pass: options.pass } : undefined,
    });
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transport.sendMail({ from: this.options.from, ...message });
  }
}
