import { apiClient } from './client';
import type {
  CreateReservationPayload,
  Reservation,
  ReservationFilters,
  UpdateReservationPayload,
} from '@/lib/types';

/** Crea una nueva reserva. POST /reservations */
export async function createReservation(
  payload: CreateReservationPayload,
): Promise<Reservation> {
  const { data } = await apiClient.post<Reservation>('/reservations', payload);
  return data;
}

/** Lista reservas con filtros opcionales. GET /reservations?date=&status= */
export async function getReservations(
  filters: ReservationFilters = {},
): Promise<Reservation[]> {
  const params: Record<string, string> = {};
  if (filters.date) params.date = filters.date;
  if (filters.status) params.status = filters.status;

  const { data } = await apiClient.get<Reservation[]>('/reservations', { params });
  return data;
}

/** Obtiene una reserva por id. GET /reservations/:id */
export async function getReservation(id: string): Promise<Reservation> {
  const { data } = await apiClient.get<Reservation>(`/reservations/${id}`);
  return data;
}

/** Actualiza una reserva. PATCH /reservations/:id */
export async function updateReservation(
  id: string,
  payload: UpdateReservationPayload,
): Promise<Reservation> {
  const { data } = await apiClient.patch<Reservation>(`/reservations/${id}`, payload);
  return data;
}

/** Cancela una reserva. DELETE /reservations/:id */
export async function cancelReservation(id: string): Promise<Reservation> {
  const { data } = await apiClient.delete<Reservation>(`/reservations/${id}`);
  return data;
}
