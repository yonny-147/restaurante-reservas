import { ApiProperty } from '@nestjs/swagger';

/**
 * Respuesta del health check del sistema.
 */
export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: 1234, description: 'Segundos en línea' })
  uptime: number;

  @ApiProperty({ example: '2026-06-06T15:00:00.000Z' })
  timestamp: string;
}
