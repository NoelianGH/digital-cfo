// frontend/src/services/promoService.ts
import { apiRequest } from './api';

export interface PromoItem {
  id: string;
  title: string;
  description?: string | null;
  type: 'DISKON' | 'CASHBACK' | 'BUY_ONE_GET_ONE' | 'LAINNYA';
  value: number;
  minPurchase?: number | null;
  startDate: string;
  endDate: string;
  status: 'AKTIF' | 'NON_AKTIF' | 'EXPIRED';
  claimedCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const promoService = {
  // 1. Get all promos
  async getPromos(): Promise<{ success: boolean; data?: PromoItem[]; error?: string }> {
    return apiRequest<PromoItem[]>('/promos', { method: 'GET' });
  },

  // 2. Get promo by ID
  async getPromoById(id: string): Promise<{ success: boolean; data?: PromoItem; error?: string }> {
    return apiRequest<PromoItem>(`/promos/${id}`, { method: 'GET' });
  },

  // 3. Add promo
  async addPromo(payload: {
    title: string;
    description?: string;
    type?: string;
    value: number;
    minPurchase?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<{ success: boolean; data?: PromoItem; error?: string }> {
    return apiRequest<PromoItem>('/promos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 4. Update promo
  async updatePromo(
    id: string,
    payload: {
      title?: string;
      description?: string;
      type?: string;
      value?: number;
      minPurchase?: number;
      startDate?: string;
      endDate?: string;
      status?: string;
    }
  ): Promise<{ success: boolean; data?: PromoItem; error?: string }> {
    return apiRequest<PromoItem>(`/promos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // 5. Delete promo
  async deletePromo(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return apiRequest(`/promos/${id}`, {
      method: 'DELETE',
    });
  },
};
