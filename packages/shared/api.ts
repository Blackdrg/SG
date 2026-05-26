const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function api<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...rest } = options;
  
  const headers = new Headers(rest.headers);
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export const authApi = {
  login: (email: string, password: string) => 
    api<{ access_token: string; refresh_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (data: { fullName: string; email: string; phone: string; password: string }) =>
    api<{ access_token: string; refresh_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const restaurantsApi = {
  list: (lat?: number, lng?: number) => 
    api<any[]>('/restaurants', { 
      method: 'GET',
      headers: lat && lng ? { 'x-location': `${lat},${lng}` } : undefined,
    }),
  
  get: (id: string) => api<any>(`/restaurants/${id}`),
  
  search: (query: string) => api<any[]>(`/restaurants/search?q=${encodeURIComponent(query)}`),
};

export const ordersApi = {
  list: (token: string) => api<any[]>('/orders', { token }),
  
  get: (id: string, token: string) => api<any>(`/orders/${id}`, { token }),
  
  create: (data: any, token: string) =>
    api<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
  
  track: (id: string) => api<any>(`/orders/${id}/track`),
};

export const menuApi = {
  list: (restaurantId: string) => api<any[]>(`/restaurants/${restaurantId}/menu`),
  
  categories: (restaurantId: string) => api<any[]>(`/restaurants/${restaurantId}/categories`),
};

export default {
  auth: authApi,
  restaurants: restaurantsApi,
  orders: ordersApi,
  menu: menuApi,
};