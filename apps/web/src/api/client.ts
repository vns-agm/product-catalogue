import type {
  ApiError,
  CategoriesResponse,
  CategoryPageResponse,
  EnquiryRequest,
  EnquiryResponse,
  FeaturedResponse,
  ProductResponse,
  SearchResponse,
} from '@catalogue/contracts';

/** Same-origin by default; set VITE_API_BASE_URL only if the API lives elsewhere. */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      ...init,
      headers: { accept: 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiRequestError(0, 'network_error', 'Could not reach the server. Check your connection.');
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = (body as ApiError | null)?.error;
    throw new ApiRequestError(
      response.status,
      error?.code ?? 'unknown_error',
      error?.message ?? 'Something went wrong. Please try again.',
      error?.fields,
    );
  }
  return body as T;
}

/** Every call the web app makes to the backend. Components never call fetch directly. */
export const api = {
  featured: () => request<FeaturedResponse>('/featured'),
  categories: () => request<CategoriesResponse>('/categories'),
  category: (slug: string) => request<CategoryPageResponse>(`/categories/${encodeURIComponent(slug)}`),
  search: (query: string) => request<SearchResponse>(`/search?q=${encodeURIComponent(query)}`),
  product: (id: string) => request<ProductResponse>(`/products/${encodeURIComponent(id)}`),
  submitEnquiry: (enquiry: EnquiryRequest) =>
    request<EnquiryResponse>('/enquiries', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(enquiry),
    }),
};
