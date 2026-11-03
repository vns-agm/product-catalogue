import { z } from 'zod';

/** Server-side source of truth for enquiry validation. The client mirrors it loosely for UX only. */
export const enquirySchema = z.object({
  productId: z.string().trim().min(1, 'Product is required').max(64),
  name: z.string({ required_error: 'Please enter your name' }).trim().min(1, 'Please enter your name').max(100, 'Name is too long'),
  email: z.string({ required_error: 'Please enter your email address' }).trim().toLowerCase().email('Please enter a valid email address').max(254),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone number is too long')
    .regex(/^[+()\d\s.-]*$/, 'Please enter a valid phone number')
    .optional()
    .transform((value) => value || undefined),
  message: z
    .string()
    .trim()
    .max(2000, 'Message is too long')
    .optional()
    .transform((value) => value || undefined),
  company: z.string().optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
