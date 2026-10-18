const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchProductReviews(productId) {
  const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function fetchWeeklySales(productId) {
  const res = await fetch(`${API_URL}/products/${productId}/weekly-sales`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch weekly sales');
  return res.json();
}

export async function submitReview(productId, { rating, title, comment }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('customerToken') : null;
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, rating, title, comment }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to submit review' }));
    throw new Error(error.message || 'Failed to submit review');
  }

  return res.json();
}
