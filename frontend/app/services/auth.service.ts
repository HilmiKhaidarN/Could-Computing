import { apiClient } from './api';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types/auth.types';

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterRequest): Promise<User> {
    const { data } = await apiClient.post<User>('/auth/register', payload);
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/profile');
    return data;
  },

  logout(): void {
    localStorage.removeItem('access_token');
  },
};
