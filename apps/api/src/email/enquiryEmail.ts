import type { Enquiry } from '../enquiries/enquiryRepository';
import type { EmailMessage } from './emailSender';

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );

/** Strip line breaks so customer input can never add lines to the subject header. */
const singleLine = (value: string) => value.replace(/[\r\n]+/g, ' ');

export function buildSalesEnquiryEmail(enquiry: Enquiry, salesInbox: string): EmailMessage {
  const rows: Array<[string, string]> = [
    ['Product', `${enquiry.productTitle} (id ${enquiry.productId})`],
    ['Name', enquiry.name],
    ['Email', enquiry.email],
    ['Phone', enquiry.phone ?? '—'],
    ['Message', enquiry.message ?? '—'],
    ['Enquiry id', enquiry.id],
    ['Received', enquiry.createdAt],
  ];

  return {
    to: salesInbox,
    replyTo: enquiry.email,
    subject: singleLine(`New enquiry: ${enquiry.productTitle} — ${enquiry.name}`),
    text: rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
    html: `<h2>New product enquiry</h2><table>${rows
      .map(
        ([label, value]) =>
          `<tr><th align="left" valign="top">${label}</th><td style="white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
      )
      .join('')}</table>`,
  };
}
