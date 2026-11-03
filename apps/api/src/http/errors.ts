/** Errors that the HTTP layer knows how to turn into a response. */
export abstract class AppError extends Error {
  abstract readonly status: number;
  abstract readonly code: string;
  /** Whether `message` is safe to show to the client. */
  readonly expose: boolean = true;
}

export class NotFoundError extends AppError {
  readonly status = 404;
  readonly code = 'not_found';
}

export class ValidationError extends AppError {
  readonly status = 400;
  readonly code = 'validation_failed';

  constructor(
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

/** The product data source failed. Details are logged, not sent to the client. */
export class UpstreamError extends AppError {
  readonly status = 502;
  readonly code = 'upstream_unavailable';
  override readonly expose = false;
}
