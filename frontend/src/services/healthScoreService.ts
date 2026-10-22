// frontend/src/services/healthScoreService.ts
import { apiRequest } from './api';

export type AnalysisPeriod = '1m' | '3m' | '6m' | '1y';

export interface HealthScoreData {
  id: string;
  score: number;
  category: 'KRITIS' | 'WASPADA' | 'SEHAT';
  createdAt: string;
  period?: AnalysisPeriod;
  transactionCount?: number;
  indicators?: {
    cash_runway?: number;
    unit_economics?: number;
    trend_analysis?: number;
    cashRunwayBulan?: number;
    profitMargin?: number;
    trendGrowth?: number;
  };
  recommended_actions?: Array<{
    id: string;
    preference_value: number;
    rank: number;
    action?: {
      title: string;
      description?: string;
    };
  }>;
}

/** Minimum transactions required per period before we show recommendations */
export const PERIOD_MIN_TRANSACTIONS: Record<AnalysisPeriod, number> = {
  '1m': 7,
  '3m': 20,
  '6m': 40,
  '1y': 80,
};

export const PERIOD_LABELS: Record<AnalysisPeriod, string> = {
  '1m': '1 Bulan',
  '3m': '3 Bulan',
  '6m': '6 Bulan',
  '1y': '1 Tahun',
};

export const healthScoreService = {
  async getHealthScore(period: AnalysisPeriod = '1m'): Promise<{
    success: boolean;
    message?: string;
    data?: HealthScoreData;
    error?: string;
  }> {
    return apiRequest<HealthScoreData>(`/health-score?period=${period}`, { method: 'GET' });
  },

  /** Fetch transactions filtered to a date window and return the count */
  async getTransactionCountForPeriod(period: AnalysisPeriod): Promise<number> {
    const now = new Date();
    const from = new Date(now);
    if (period === '1m') from.setMonth(now.getMonth() - 1);
    else if (period === '3m') from.setMonth(now.getMonth() - 3);
    else if (period === '6m') from.setMonth(now.getMonth() - 6);
    else from.setFullYear(now.getFullYear() - 1);

    try {
      const res = await apiRequest<any[]>('/transactions', { method: 'GET' });
      if (!res.success || !res.data) return 0;
      const fromTime = from.getTime();
      return res.data.filter((t: any) => {
        const d = new Date(t.date || t.createdAt || 0).getTime();
        return d >= fromTime;
      }).length;
    } catch {
      return 0;
    }
  },
};
