import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ReservationStatus } from '../entities/reservation.entity';
import { CreateReservationDto } from './create-reservation.dto';

/**
 * DTO para actualizar una reserva.
 * Hereda todos los campos de CreateReservationDto como opcionales y añade
 * la posibilidad de cambiar el estado (validado contra el flujo permitido
 * en el servicio).
 */
export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  @ApiPropertyOptional({ enum: ReservationStatus })
  @IsOptional()
  @IsEnum(ReservationStatus, {
    message: `status debe ser uno de: ${Object.values(ReservationStatus).join(', ')}`,
  })
  status?: ReservationStatus;
}
