const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export class AuthError extends Error {}

async function parseErrorMessage(res) {
  try {
    const body = await res.json();
    if (Array.isArray(body.message)) return body.message.join(', ');
    return body.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

/** Logs in with the admin's email/password. Backend sets httpOnly session cookies. */
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new AuthError(await parseErrorMessage(res));
  return res.json();
}

/** Clears the session server-side and locally. Never throws. */
export async function logout() {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {});
}

/** Returns the current admin, or null if there's no valid session. */
export async function fetchMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: 'include',
    cache: 'no-store',
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new AuthError(await parseErrorMessage(res));
  return res.json();
}

async function tryRefresh() {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  return res.ok;
}

/**
 * Authenticated fetch for admin API calls. The access token expires after 15
 * minutes; on a 401 it silently rotates the session via the refresh cookie
 * and retries once before giving up.
 */
export async function apiFetch(path, options = {}) {
  // Don't force JSON headers for file uploads — the browser must set its own
  // multipart boundary on the Content-Type header for FormData bodies.
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const doFetch = () =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
      },
    });

  let res = await doFetch();
  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) res = await doFetch();
  }
  return res;
}
