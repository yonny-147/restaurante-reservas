import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, Matches } from 'class-validator';
import { ReservationStatus } from '../entities/reservation.entity';

/**
 * Filtros opcionales para el listado de reservas (GET /reservations).
 */
export class QueryReservationDto {
  @ApiPropertyOptional({
    example: '2026-06-20',
    description: 'Filtrar por fecha (YYYY-MM-DD)',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date debe tener el formato YYYY-MM-DD',
  })
  date?: string;

  @ApiPropertyOptional({ enum: ReservationStatus, description: 'Filtrar por estado' })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
