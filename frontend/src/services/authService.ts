// frontend/src/services/authService.ts
import { apiRequest, getStoredToken, setStoredToken, removeStoredAuth } from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  businessName?: string | null;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    transactions?: number;
    products?: number;
    promos?: number;
  };
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: UserProfile;
  error?: string;
}

export const authService = {
  // 1. Register User
  async register(name: string, email: string, password: string, businessName: string): Promise<AuthResponse> {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({ name, email, password, businessName }),
    });

    const token = res.token as string | undefined;
    const user = res.user as UserProfile | undefined;

    if (res.success && token && user) {
      setStoredToken(token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cfo_user', JSON.stringify(user));
      }
    }

    return {
      success: res.success,
      message: res.message,
      error: res.error,
      token,
      user,
    };
  },

  // 2. Login User
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({ email, password }),
    });

    const token = res.token as string | undefined;
    const user = res.user as UserProfile | undefined;

    if (res.success && token && user) {
      setStoredToken(token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cfo_user', JSON.stringify(user));
      }
    }

    return {
      success: res.success,
      message: res.message,
      error: res.error,
      token,
      user,
    };
  },


  // 3. Get Profile
  async getProfile(): Promise<{ success: boolean; data?: UserProfile; error?: string }> {
    const res = await apiRequest<UserProfile>('/user/profile', {
      method: 'GET',
    });
    if (res.success && res.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cfo_user', JSON.stringify(res.data));
      }
    }
    return res;
  },

  // 4. Update Profile
  async updateProfile(data: {
    name?: string;
    businessName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ success: boolean; data?: UserProfile; message?: string; error?: string }> {
    const res = await apiRequest<UserProfile>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cfo_user', JSON.stringify(res.data));
      }
    }

    return res;
  },

  // 5. Delete Profile (Account)
  async deleteProfile(confirmationPassword?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await apiRequest('/user/profile', {
      method: 'DELETE',
      body: JSON.stringify({ confirmationPassword }),
    });

    if (res.success) {
      removeStoredAuth();
    }

    return res;
  },

  // 6. Session helpers
  getStoredUser(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    const str = localStorage.getItem('cfo_user');
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  },

  getStoredToken(): string | null {
    return getStoredToken();
  },

  isAuthenticated(): boolean {
    return !!getStoredToken();
  },

  logout(): void {
    removeStoredAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
  },
};
