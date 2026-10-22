// frontend/src/services/productService.ts
import { apiRequest } from './api';

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const productService = {
  // 1. Get products
  async getProducts(): Promise<{ success: boolean; data?: ProductItem[]; error?: string }> {
    return apiRequest<ProductItem[]>('/products', { method: 'GET' });
  },

  // 2. Get product by ID
  async getProductById(id: string): Promise<{ success: boolean; data?: ProductItem; error?: string }> {
    return apiRequest<ProductItem>(`/products/${id}`, { method: 'GET' });
  },

  // 3. Add product
  async addProduct(payload: {
    name: string;
    price: number;
    category?: string;
    stock?: number;
  }): Promise<{ success: boolean; data?: ProductItem; error?: string }> {
    return apiRequest<ProductItem>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 4. Update product
  async updateProduct(
    id: string,
    payload: {
      name?: string;
      price?: number;
      category?: string;
      stock?: number;
      isActive?: boolean;
    }
  ): Promise<{ success: boolean; data?: ProductItem; error?: string }> {
    return apiRequest<ProductItem>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // 5. Delete product
  async deleteProduct(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // 6. Checkout Sale (POS)
  async checkoutSale(payload: {
    paymentMethod: string;
    items: Array<{ productId: string; qty: number }>;
  }): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
    return apiRequest('/sales', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
