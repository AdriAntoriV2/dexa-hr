const API_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

const TOKEN_KEY = 'dexa_hr_access_token';
const USER_KEY = 'dexa_hr_user';

let accessToken: string | null = sessionStorage.getItem(TOKEN_KEY);

export function setAccessToken(token: string | null) {
  accessToken = token;

  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
}

export function saveStoredUser(user: unknown) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser<T>(): T | null {
  try {
    const value = sessionStorage.getItem(USER_KEY);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    sessionStorage.removeItem(USER_KEY);
    return null;
  }
}

export function getAccessToken() {
  return accessToken;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      setAccessToken(null);
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const body = await response.json().catch(() => null);
    const message =
      typeof body?.message === 'string'
        ? body.message
        : `Request failed (${response.status})`;

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}