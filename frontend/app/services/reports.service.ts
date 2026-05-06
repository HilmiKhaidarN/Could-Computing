import { apiClient } from './api';
import type { ApiReport } from '@/app/lib/types';

/** Ambil semua laporan dengan AI score dari backend */
export async function fetchReports(): Promise<ApiReport[]> {
  const { data } = await apiClient.get<ApiReport[]>('/decision/reports');
  return data;
}

/** Ambil satu laporan berdasarkan ID */
export async function fetchReportById(id: string): Promise<ApiReport> {
  const { data } = await apiClient.get<ApiReport>(`/decision/reports/${id}`);
  return data;
}

/** Update status laporan (admin only) */
export async function updateReportStatus(
  id: string,
  status: ApiReport['status'],
): Promise<ApiReport> {
  const { data } = await apiClient.patch<ApiReport>(`/reports/${id}`, { status });
  return data;
}
