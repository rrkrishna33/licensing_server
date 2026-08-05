import { api } from './client';
import type { Customer } from '../types';

export const getCustomers = () =>
  api.get<{ ok: boolean; customers: Customer[] }>('/api/admin/customers');

export const getCustomer = (id: number) =>
  api.get<{ ok: boolean; customer: Customer }>(`/api/admin/customers/${id}`);

export const createCustomer = (data: { name: string; contactEmail?: string; contactPhone?: string }) =>
  api.post<{ ok: boolean; customer: Customer }>('/api/admin/customers', data);
