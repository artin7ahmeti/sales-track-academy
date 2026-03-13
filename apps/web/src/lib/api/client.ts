type RequestOptions = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiClientError(
      response.status,
      body.message || `Request failed with status ${response.status}`,
      body.errors,
    );
  }

  const body = await response.json();
  // Unwrap the { data } envelope from the API transform interceptor
  return body.data !== undefined ? body.data : body;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
    signal: options?.signal,
  });

  // Handle 401 — attempt token refresh once
  if (response.status === 401 && !path.includes('/auth/refresh')) {
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    });

    if (refreshResponse.ok) {
      // Retry original request
      const retryResponse = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
        signal: options?.signal,
      });
      return handleResponse<T>(retryResponse);
    }

    // Refresh failed — redirect to login
    if (typeof window !== 'undefined') {
      const { pathname } = window.location;
      const isPublicRoute = pathname === '/' || pathname.startsWith('/public');
      if (!isPublicRoute) {
        window.location.replace('/public/login');
      }
    }
    throw new ApiClientError(401, 'Session expired');
  }

  return handleResponse<T>(response);
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
};

export { ApiClientError };
