// frontend/src/services/userStoreService.ts
import { apiRequest } from './api';
import { StoreItem, StoreCategory } from './adminService';

export interface CreateUserStorePayload {
  name: string;
  category: StoreCategory;
  address?: string;
  description?: string;
}

export interface UpdateUserStorePayload {
  name?: string;
  category?: StoreCategory;
  address?: string;
  description?: string;
  status?: string;
}

export const userStoreService = {
  // 1. Get all stores of the authenticated user
  async getMyStores(): Promise<{ success: boolean; data?: StoreItem[]; error?: string }> {
    return apiRequest<StoreItem[]>('/user/stores', { method: 'GET' });
  },

  // 2. Create store
  async createStore(payload: CreateUserStorePayload): Promise<{ success: boolean; data?: StoreItem; message?: string; error?: string }> {
    return apiRequest<StoreItem>('/user/stores', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 3. Update store
  async updateStore(id: string, payload: UpdateUserStorePayload): Promise<{ success: boolean; data?: StoreItem; message?: string; error?: string }> {
    return apiRequest<StoreItem>(`/user/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // 4. Delete store
  async deleteStore(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return apiRequest(`/user/stores/${id}`, {
      method: 'DELETE',
    });
  },
};
