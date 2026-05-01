import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { QueryReservationDto } from './dto/query-reservation.dto';
import { ReservationResponseDto } from './dto/reservation-response.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsService } from './reservations.service';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva reserva' })
  @ApiCreatedResponse({ type: ReservationResponseDto })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o violación de regla de negocio',
  })
  @ApiConflictResponse({ description: 'La mesa ya está reservada (doble reserva)' })
  create(@Body() dto: CreateReservationDto): ReservationResponseDto {
    return this.reservationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar reservas (filtros: date, status)' })
  @ApiOkResponse({ type: ReservationResponseDto, isArray: true })
  findAll(@Query() query: QueryReservationDto): ReservationResponseDto[] {
    return this.reservationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reserva por id' })
  @ApiOkResponse({ type: ReservationResponseDto })
  @ApiNotFoundResponse({ description: 'La reserva no existe' })
  findOne(@Param('id') id: string): ReservationResponseDto {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una reserva (reprogramar, comensales o estado)',
  })
  @ApiOkResponse({ type: ReservationResponseDto })
  @ApiNotFoundResponse({ description: 'La reserva no existe' })
  @ApiBadRequestResponse({ description: 'Violación de regla de negocio' })
  @ApiConflictResponse({ description: 'La mesa ya está reservada (doble reserva)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReservationDto,
  ): ReservationResponseDto {
    return this.reservationsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar una reserva' })
  @ApiOkResponse({ type: ReservationResponseDto })
  @ApiNotFoundResponse({ description: 'La reserva no existe' })
  cancel(@Param('id') id: string): ReservationResponseDto {
    return this.reservationsService.cancel(id);
  }
}
