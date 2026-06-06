import { ApiProperty } from '@nestjs/swagger';

/**
 * Estados posibles de una reserva.
 *
 * Flujo permitido:
 *   PENDING → CONFIRMED → SEATED → COMPLETED
 *   Cualquier estado no terminal → CANCELLED
 */
export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SEATED = 'SEATED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Transiciones de estado válidas. La clave es el estado origen y el valor
 * los estados destino permitidos.
 */
export const STATUS_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> =
  {
    [ReservationStatus.PENDING]: [
      ReservationStatus.CONFIRMED,
      ReservationStatus.CANCELLED,
    ],
    [ReservationStatus.CONFIRMED]: [
      ReservationStatus.SEATED,
      ReservationStatus.CANCELLED,
    ],
    [ReservationStatus.SEATED]: [
      ReservationStatus.COMPLETED,
      ReservationStatus.CANCELLED,
    ],
    [ReservationStatus.COMPLETED]: [],
    [ReservationStatus.CANCELLED]: [],
  };

/**
 * Entidad Reserva (almacenamiento en memoria).
 */
export class Reservation {
  @ApiProperty({ example: 'a3f1c2e4-...', description: 'UUID de la reserva' })
  id: string;

  @ApiProperty({ example: 'Juan Pérez' })
  customerName: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  customerEmail: string;

  @ApiProperty({ example: '+57 3001234567' })
  customerPhone: string;

  @ApiProperty({ example: '2026-06-20', description: 'Fecha ISO (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ example: '19:30', description: 'Hora HH:mm' })
  time: string;

  @ApiProperty({ example: 4, description: 'Número de comensales (1-20)' })
  partySize: number;

  @ApiProperty({ example: 3, nullable: true, description: 'Id de la mesa asignada' })
  tableId: number | null;

  @ApiProperty({ enum: ReservationStatus, example: ReservationStatus.PENDING })
  status: ReservationStatus;

  @ApiProperty({ example: '2026-06-06T15:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-06-06T15:00:00.000Z' })
  updatedAt: string;
}
