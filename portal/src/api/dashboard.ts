import { api } from './client';
import type { DashboardStats } from '../types';

export const getStats = () =>
  api.get<{ ok: boolean; stats: DashboardStats }>('/api/admin/stats');
