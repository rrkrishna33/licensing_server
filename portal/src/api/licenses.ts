import { api } from './client';
import type { License, LicenseDetail } from '../types';

export const getLicenses = () =>
  api.get<{ ok: boolean; licenses: License[] }>('/api/admin/licenses');

export const getLicense = (id: number) =>
  api.get<{ ok: boolean; license: LicenseDetail }>(`/api/admin/licenses/${id}`);

export const createLicense = (data: {
  customerId: number;
  productName: string;
  maxMachines: number;
  validDays: number;
}) => api.post<{ ok: boolean; license: License }>('/api/admin/licenses', data);

export const updateLicenseStatus = (id: number, status: string) =>
  api.patch<{ ok: boolean; license: License }>(`/api/admin/licenses/${id}/status`, { status });
