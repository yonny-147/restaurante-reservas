import { apiClient } from './client';
import type { Table } from '@/lib/types';

/** Lista todas las mesas. GET /tables */
export async function getTables(): Promise<Table[]> {
  const { data } = await apiClient.get<Table[]>('/tables');
  return data;
}

/** Consulta mesas disponibles por fecha y franja. GET /tables/available?date=&time= */
export async function getAvailableTables(
  date: string,
  time: string,
): Promise<Table[]> {
  const { data } = await apiClient.get<Table[]>('/tables/available', {
    params: { date, time },
  });
  return data;
}
