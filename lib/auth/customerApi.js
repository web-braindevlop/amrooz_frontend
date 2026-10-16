const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export class CustomerAuthError extends Error {}

async function parseErrorMessage(res) {
  try {
    const body = await res.json();
    if (Array.isArray(body.message)) return body.message.join(', ');
    return body.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

/**
 * Get the stored JWT token from localStorage.
 */
function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('customerToken');
}

/**
 * Login customer with email and password.
 * Returns { customer, accessToken }.
 */
export async function loginCustomer(email, password) {
  const res = await fetch(`${API_BASE}/customer-auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new CustomerAuthError(await parseErrorMessage(res));
  return res.json();
}

/**
 * Register a new customer.
 * Returns { customer, accessToken }.
 */
export async function registerCustomer(data) {
  const res = await fetch(`${API_BASE}/customer-auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new CustomerAuthError(await parseErrorMessage(res));
  return res.json();
}

/**
 * Fetch current customer profile.
 * Requires valid JWT token in localStorage.
 */
export async function fetchCustomerMe() {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE}/customers/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new CustomerAuthError(await parseErrorMessage(res));
  return res.json();
}

/**
 * Update customer profile (firstName, lastName, phone).
 */
export async function updateCustomerProfile(data) {
  const token = getToken();
  if (!token) throw new CustomerAuthError('Not authenticated');

  const res = await fetch(`${API_BASE}/customers/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new CustomerAuthError(await parseErrorMessage(res));
  return res.json();
}

/**
 * Fetch customer's order history.
 */
export async function fetchCustomerOrders() {
  const token = getToken();
  if (!token) throw new CustomerAuthError('Not authenticated');

  const res = await fetch(`${API_BASE}/customers/me/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new CustomerAuthError(await parseErrorMessage(res));
  return res.json();
}
