// frontend/src/services/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cfo_token');
}

export function setStoredToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cfo_token', token);
  }
}

export function removeStoredAuth(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cfo_token');
    localStorage.removeItem('cfo_user');
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  [key: string]: any;
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {

  const { requiresAuth = true, headers = {}, ...rest } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = getStoredToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
      return {
        success: false,
        error: errorMessage,
      };
    }

    return data;
  } catch (error: any) {
    console.error(`API Error on ${url}:`, error);
    return {
      success: false,
      error: error.message || 'Terjadi gangguan koneksi ke server backend',
    };
  }
}

export async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const token = getStoredToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: data?.error || data?.message || `Upload failed with status ${response.status}`,
      };
    }

    return data;
  } catch (error: any) {
    console.error(`Upload Error on ${url}:`, error);
    return {
      success: false,
      error: error.message || 'Terjadi gangguan saat mengunggah file',
    };
  }
}

export { API_BASE_URL };
