import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../entities/reservation.entity';

/**
 * Representación que la API devuelve al cliente para una reserva.
 * Coincide con la entidad pero se declara de forma explícita para
 * documentar el contrato (API First) y desacoplarlo del modelo interno.
 */
export class ReservationResponseDto {
  @ApiProperty({ example: 'a3f1c2e4-5b6d-7e8f-9a0b-1c2d3e4f5a6b' })
  id: string;

  @ApiProperty({ example: 'Juan Pérez' })
  customerName: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  customerEmail: string;

  @ApiProperty({ example: '+57 3001234567' })
  customerPhone: string;

  @ApiProperty({ example: '2026-06-20' })
  date: string;

  @ApiProperty({ example: '19:30' })
  time: string;

  @ApiProperty({ example: 4 })
  partySize: number;

  @ApiProperty({ example: 3, nullable: true })
  tableId: number | null;

  @ApiProperty({ enum: ReservationStatus, example: ReservationStatus.PENDING })
  status: ReservationStatus;

  @ApiProperty({ example: '2026-06-06T15:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-06-06T15:00:00.000Z' })
  updatedAt: string;
}
