// frontend/src/services/adminService.ts
import { apiRequest } from './api';
import { UserProfile } from './authService';

export interface AdminStats {
  totalUsers: number;
  totalTransactions: number;
  totalProducts: number;
  totalSales: number;
  totalVolume: number;
  totalStores?: number;
}

export type StoreStatus = "requested" | "accepted" | "rejected" | "suspended" | "active";
export type StoreCategory = "kuliner" | "fashion" | "elektronik" | "kecantikan" | "pertanian" | "jasa" | "lainnya";

export interface StoreItem {
  id: string;
  name: string;
  ownerName: string;
  category: StoreCategory;
  status: StoreStatus;
  address: string;
  description?: string;
  productCount: number;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStorePayload {
  name: string;
  ownerName: string;
  category: StoreCategory;
  status: StoreStatus;
  address?: string;
  description?: string;
  productCount?: number;
  userId?: string;
}

export interface UpdateStorePayload {
  name?: string;
  ownerName?: string;
  category?: StoreCategory;
  status?: StoreStatus;
  address?: string;
  description?: string;
  productCount?: number;
}

export const adminService = {
  // 1. Get all users for admin
  async getAllUsers(): Promise<{ success: boolean; data?: UserProfile[]; error?: string }> {
    return apiRequest<UserProfile[]>('/admin/users', { method: 'GET' });
  },

  // 2. Admin create user
  async createUser(payload: {
    name: string;
    email: string;
    password: string;
    businessName?: string;
    role?: 'USER' | 'ADMIN';
  }): Promise<{ success: boolean; data?: UserProfile; message?: string; error?: string }> {
    return apiRequest<UserProfile>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 3. Admin update user
  async updateUser(
    id: string,
    payload: {
      name?: string;
      email?: string;
      businessName?: string;
      role?: 'USER' | 'ADMIN';
      password?: string;
    }
  ): Promise<{ success: boolean; data?: UserProfile; message?: string; error?: string }> {
    return apiRequest<UserProfile>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // 4. Admin delete user
  async deleteUser(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  // 5. Admin platform stats
  async getStats(): Promise<{ success: boolean; data?: AdminStats; error?: string }> {
    return apiRequest<AdminStats>('/admin/stats', { method: 'GET' });
  },

  // 6. Get all feedbacks (kritik & saran)
  async getFeedbacks(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    return apiRequest<any[]>('/admin/feedbacks', { method: 'GET' });
  },

  // 7. Get all stores
  async getAllStores(): Promise<{ success: boolean; data?: StoreItem[]; error?: string }> {
    return apiRequest<StoreItem[]>('/admin/stores', { method: 'GET' });
  },

  // 8. Create store
  async createStore(payload: CreateStorePayload): Promise<{ success: boolean; data?: StoreItem; message?: string; error?: string }> {
    return apiRequest<StoreItem>('/admin/stores', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 9. Update store
  async updateStore(id: string, payload: UpdateStorePayload): Promise<{ success: boolean; data?: StoreItem; message?: string; error?: string }> {
    return apiRequest<StoreItem>(`/admin/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // 10. Update store status
  async updateStoreStatus(id: string, status: StoreStatus): Promise<{ success: boolean; data?: StoreItem; message?: string; error?: string }> {
    return apiRequest<StoreItem>(`/admin/stores/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // 11. Delete store
  async deleteStore(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return apiRequest(`/admin/stores/${id}`, {
      method: 'DELETE',
    });
  },
};
