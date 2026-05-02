import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

/**
 * Parámetros de consulta para verificar disponibilidad de mesas
 * en una fecha y franja horaria concretas.
 */
export class QueryAvailableDto {
  @ApiProperty({
    example: '2026-06-20',
    description: 'Fecha en formato ISO (YYYY-MM-DD)',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date debe tener el formato YYYY-MM-DD',
  })
  date: string;

  @ApiProperty({
    example: '19:30',
    description: 'Hora en formato HH:mm (franja de 30 min)',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'time debe tener el formato HH:mm',
  })
  time: string;
}
