// Tipos compartidos que reflejan los DTOs del backend NestJS.

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SEATED'
  | 'COMPLETED'
  | 'CANCELLED';

export type TableLocation = 'INDOOR' | 'OUTDOOR' | 'TERRACE' | 'PRIVATE';

export interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  partySize: number;
  tableId: number | null;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  partySize: number;
  tableId?: number;
}

export type UpdateReservationPayload = Partial<CreateReservationPayload> & {
  status?: ReservationStatus;
};

export interface Table {
  id: number;
  label: string;
  capacity: number;
  location: TableLocation;
}

export interface ReservationFilters {
  date?: string;
  status?: ReservationStatus;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
  errorCode?: string;
  timestamp?: string;
  path?: string;
}
