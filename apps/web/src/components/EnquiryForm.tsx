import type { EnquiryRequest, ProductSummary } from '@catalogue/contracts';
import { type FormEvent, useState } from 'react';
import { api, ApiRequestError } from '../api/client';
import { Icon } from './Icon';

type Fields = Pick<EnquiryRequest, 'name' | 'email' | 'phone' | 'message' | 'company'>;
type FieldErrors = Partial<Record<keyof Fields | '_', string>>;

const EMPTY: Fields = { name: '', email: '', phone: '', message: '', company: '' };

/** Quick client-side checks for fast feedback. The API re-validates everything. */
function validate(fields: Fields): FieldErrors {
  const errors: FieldErrors = {};
  if (!fields.name.trim()) errors.name = 'Please enter your name';
  if (!/^\S+@\S+\.\S+$/.test(fields.email.trim())) errors.email = 'Please enter a valid email address';
  return errors;
}

export function EnquiryForm({ product }: { product: Pick<ProductSummary, 'id' | 'title'> }) {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<'editing' | 'submitting' | 'sent'>('editing');

  const update = (name: keyof Fields) => (event: { target: { value: string } }) =>
    setFields((current) => ({ ...current, [name]: event.target.value }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const clientErrors = validate(fields);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setState('submitting');
    try {
      await api.submitEnquiry({ productId: product.id, ...fields });
      setState('sent');
    } catch (error) {
      setState('editing');
      if (error instanceof ApiRequestError) {
        setErrors({ ...error.fields, _: error.fields ? undefined : error.message });
      } else {
        setErrors({ _: 'Something went wrong. Please try again.' });
      }
    }
  }

  if (state === 'sent') {
    return (
      <div className="enquiry-thanks" role="status">
        <div className="enquiry-thanks__icon" aria-hidden="true">
          <Icon name="check" size={22} />
        </div>
        <h2>Thank you</h2>
        <p>
          We've received your enquiry about <strong>{product.title}</strong> and will be in touch at{' '}
          {fields.email.trim()} soon.
        </p>
      </div>
    );
  }

  const fieldProps = (name: keyof Fields) => ({
    id: `enquiry-${name}`,
    name,
    value: fields[name] ?? '',
    onChange: update(name),
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `enquiry-${name}-error` : undefined,
  });
  const fieldError = (name: keyof Fields) =>
    errors[name] && (
      <p id={`enquiry-${name}-error`} className="field__error">
        {errors[name]}
      </p>
    );

  return (
    <form className="enquiry-form" onSubmit={onSubmit} noValidate aria-label="Enquiry form">
      <h2>Enquire about this product</h2>
      <p className="enquiry-form__intro">Leave your details and a specialist will reply within one business day.</p>
      {errors._ && (
        <p className="form-error" role="alert">
          {errors._}
        </p>
      )}

      <div className="enquiry-form__grid">
      <div className="field">
        <label htmlFor="enquiry-name">Name</label>
        <input {...fieldProps('name')} autoComplete="name" required maxLength={100} autoFocus />
        {fieldError('name')}
      </div>
      <div className="field">
        <label htmlFor="enquiry-email">Email</label>
        <input {...fieldProps('email')} type="email" autoComplete="email" required maxLength={254} />
        {fieldError('email')}
      </div>
      </div>
      <div className="field">
        <label htmlFor="enquiry-phone">
          Phone <span className="field__optional">(optional)</span>
        </label>
        <input {...fieldProps('phone')} type="tel" autoComplete="tel" maxLength={30} />
        {fieldError('phone')}
      </div>
      <div className="field">
        <label htmlFor="enquiry-message">
          Message <span className="field__optional">(optional)</span>
        </label>
        <textarea {...fieldProps('message')} rows={4} maxLength={2000} placeholder="Sizes, quantities, delivery questions…" />
        <span className="field__counter" aria-hidden="true">
          {(fields.message ?? '').length}/2000
        </span>
        {fieldError('message')}
      </div>

      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor="enquiry-company">Company</label>
        <input {...fieldProps('company')} tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className="button" disabled={state === 'submitting'}>
        {state === 'submitting' ? (
          <>
            <span className="spinner" aria-hidden="true" /> Sending…
          </>
        ) : (
          'Send enquiry'
        )}
      </button>
    </form>
  );
}
