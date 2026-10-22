// frontend/src/services/transactionService.ts
import { apiRequest } from './api';

export interface TransactionItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'MASUK' | 'KELUAR' | 'MODAL';
  category: 'PENJUALAN' | 'PEMBELIAN' | 'GAJI' | 'OPERASIONAL' | 'LAINNYA';
  source?: 'MANUAL' | 'OCR' | 'VOICE' | 'POS' | 'PDF' | string;
  paymentMethod?: 'TUNAI' | 'QRIS' | 'TRANSFER' | 'KARTU_DEBIT' | 'LAINNYA' | string;
  status?: string;
  userId?: string;
  createdAt?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalModal: number;
  totalExpense: number;
  netCashFlow: number;
  count: number;
}

export const transactionService = {
  // 1. Get all transactions
  async getTransactions(): Promise<{ success: boolean; data?: TransactionItem[]; error?: string }> {
    return apiRequest<TransactionItem[]>('/transactions', { method: 'GET' });
  },

  // 2. Add single transaction
  async addTransaction(payload: {
    date?: string;
    description: string;
    amount: number;
    type: 'MASUK' | 'KELUAR' | 'MODAL';
    category?: string;
    source?: 'MANUAL' | 'OCR' | 'VOICE' | 'POS';
    paymentMethod?: string;
  }): Promise<{ success: boolean; data?: TransactionItem; error?: string }> {
    return apiRequest<TransactionItem>('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 3. Batch import transactions (from PDF or multi OCR)
  async batchAddTransactions(
    transactions: Array<{
      date?: string;
      description: string;
      amount: number;
      type: 'MASUK' | 'KELUAR' | 'MODAL';
      category?: string;
      source?: string;
      paymentMethod?: string;
    }>
  ): Promise<{ success: boolean; data?: TransactionItem[]; message?: string; error?: string }> {
    return apiRequest<TransactionItem[]>('/transactions/batch', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    });
  },

  // 4. Update transaction
  async updateTransaction(
    id: string,
    payload: {
      date?: string;
      description?: string;
      amount?: number;
      type?: 'MASUK' | 'KELUAR' | 'MODAL';
      category?: string;
      paymentMethod?: string;
    }
  ): Promise<{ success: boolean; data?: TransactionItem; error?: string }> {
    return apiRequest<TransactionItem>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // 5. Delete transaction
  async deleteTransaction(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return apiRequest(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  // 6. Get cash flow summary
  async getSummary(): Promise<{ success: boolean; data?: TransactionSummary; error?: string }> {
    return apiRequest<TransactionSummary>('/transactions/summary', { method: 'GET' });
  },
};
