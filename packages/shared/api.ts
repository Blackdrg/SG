const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

interface ApiResponse<T> {
  data: T;
  refreshToken?: string;
}

// Enhanced API function with automatic token refresh
export async function api<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { token, ...rest } = options;
  
  // Try the request
  try {
    return await makeRequest<T>(endpoint, { token, ...rest });
  } catch (error) {
    // If we get a 401 (Unauthorized) and we have a token, try to refresh
    if (error.message && error.message.includes('401') && token) {
      try {
        // Attempt to refresh token
        const refreshResponse = await api<{ access_token: string }>('/auth/refresh-token', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
        
        const newToken = refreshResponse.data.access_token;
        
        // Retry the original request with the new token
        return await makeRequest<T>(endpoint, { token: newToken, ...rest });
      } catch (refreshError) {
        // If refresh fails, throw the original error
        throw error;
      }
    }
    
    // If not a 401 or no token to refresh, throw the original error
    throw error;
  }
}

// Helper function to make the actual request
async function makeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
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
  
  const data = await response.json();
  
  // Check if the response contains a new token (some APIs return refresh token in response)
  // This is optional and depends on your API implementation
  return { data };
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
  
  // Add refresh token endpoint
  refreshToken: (token: string) =>
    api<{ access_token: string }>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
};

export const restaurantsApi = {
  list: async (lat?: number, lng?: number) => {
    try {
      return await api<any[]>('/restaurants', { 
        method: 'GET',
        headers: lat && lng ? { 'x-location': `${lat},${lng}` } : undefined,
      });
    } catch (error) {
      console.warn('Backend unavailable, returning mock data');
      return [
        { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Spice Garden - Downtown', description: 'Biryani, Karahi, Naan', rating: 4.5, deliveryTime: 30, isActive: true },
        { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', name: 'Spice Garden - Mall Road', description: 'Burger, Fries, Shake', rating: 4.3, deliveryTime: 25, isActive: true },
        { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', name: 'Spice Garden - Gulshan', description: 'Pizza, Pasta, Salad', rating: 4.7, deliveryTime: 35, isActive: true },
      ];
    }
  },
  
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