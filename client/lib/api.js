const getApiBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  return url;
};

const API_BASE = getApiBaseUrl();


export const fetchApi = async (endpoint, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(
        res.status === 413
          ? 'File size is too large. Please select a smaller file.'
          : res.statusText || `Server returned non-JSON error (${res.status})`
      );
    }

    if (!res.ok) {
      throw new Error(data.message || 'An API error occurred');
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
};
