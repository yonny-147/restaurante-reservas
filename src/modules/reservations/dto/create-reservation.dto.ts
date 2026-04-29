import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * DTO para la creación de una reserva.
 * Toda la validación sintáctica vive aquí (class-validator); las reglas de
 * negocio se aplican en la capa de servicio.
 */
export class CreateReservationDto {
  @ApiProperty({ example: 'Juan Pérez', minLength: 2, maxLength: 80 })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  customerName: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  @IsEmail({}, { message: 'customerEmail debe ser un correo válido' })
  customerEmail: string;

  @ApiProperty({ example: '+57 3001234567' })
  @IsString()
  @Matches(/^[+]?[\d\s-]{7,20}$/, {
    message: 'customerPhone debe ser un teléfono válido',
  })
  customerPhone: string;

  @ApiProperty({ example: '2026-06-20', description: 'Fecha ISO (YYYY-MM-DD)' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date debe tener el formato YYYY-MM-DD',
  })
  date: string;

  @ApiProperty({ example: '19:30', description: 'Hora HH:mm' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'time debe tener el formato HH:mm',
  })
  time: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  partySize: number;

  @ApiPropertyOptional({
    example: 3,
    description:
      'Id de mesa concreta. Si se omite, el sistema asigna una mesa libre adecuada.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tableId?: number;
}
