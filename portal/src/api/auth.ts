import { api } from './client';

export const login = (username: string, password: string) =>
  api.post<{ ok: boolean; token: string }>('/api/auth/login', { username, password });
