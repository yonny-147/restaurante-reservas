import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { BusinessException } from '../../common/exceptions/business.exception';
import {
  MAX_DAYS_AHEAD,
  isValidSlot,
} from '../../common/constants/time-slots';
import { TablesService } from '../tables/tables.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { QueryReservationDto } from './dto/query-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import {
  Reservation,
  ReservationStatus,
  STATUS_TRANSITIONS,
} from './entities/reservation.entity';

/**
 * Servicio de reservas.
 *
 * Responsable de toda la lógica de dominio: validación de fecha/franja,
 * prevención de doble reserva, asignación de mesa y control del flujo de
 * estados. El almacenamiento es en memoria (array privado).
 */
@Injectable()
export class ReservationsService {
  private readonly reservations: Reservation[] = [];

  constructor(
    @Inject(forwardRef(() => TablesService))
    private readonly tablesService: TablesService,
  ) {}

  /** Crea una nueva reserva aplicando todas las reglas de negocio. */
  create(dto: CreateReservationDto): Reservation {
    this.validateDate(dto.date);
    this.validateSlot(dto.time);

    let tableId = dto.tableId ?? null;

    if (tableId !== null) {
      // Mesa explícita: debe existir, tener capacidad y estar libre.
      const table = this.tablesService.findOne(tableId);
      if (table.capacity < dto.partySize) {
        throw new BusinessException(
          `La mesa ${table.label} (capacidad ${table.capacity}) no admite ${dto.partySize} comensales`,
          'TABLE_CAPACITY_EXCEEDED',
        );
      }
      if (this.isTableBooked(tableId, dto.date, dto.time)) {
        throw new BusinessException(
          `La mesa ${table.label} ya está reservada el ${dto.date} a las ${dto.time}`,
          'DOUBLE_BOOKING',
          HttpStatus.CONFLICT,
        );
      }
    } else {
      // Asignación automática de la mejor mesa libre.
      const best = this.tablesService.findBestAvailable(
        dto.date,
        dto.time,
        dto.partySize,
      );
      if (!best) {
        throw new BusinessException(
          `No hay mesas disponibles para ${dto.partySize} comensales el ${dto.date} a las ${dto.time}`,
          'NO_TABLE_AVAILABLE',
        );
      }
      tableId = best.id;
    }

    const now = new Date().toISOString();
    const reservation: Reservation = {
      id: uuidv4(),
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      date: dto.date,
      time: dto.time,
      partySize: dto.partySize,
      tableId,
      status: ReservationStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    };
    this.reservations.push(reservation);
    return reservation;
  }

  /** Lista reservas, opcionalmente filtradas por fecha y/o estado. */
  findAll(query: QueryReservationDto = {}): Reservation[] {
    return this.reservations.filter((r) => {
      if (query.date && r.date !== query.date) return false;
      if (query.status && r.status !== query.status) return false;
      return true;
    });
  }

  /** Obtiene una reserva por id; lanza 404 si no existe. */
  findOne(id: string): Reservation {
    const reservation = this.reservations.find((r) => r.id === id);
    if (!reservation) {
      throw new NotFoundException(`La reserva con id ${id} no existe`);
    }
    return reservation;
  }

  /** Actualiza una reserva: reprogramación, comensales, mesa o estado. */
  update(id: string, dto: UpdateReservationDto): Reservation {
    const reservation = this.findOne(id);

    if (
      reservation.status === ReservationStatus.CANCELLED ||
      reservation.status === ReservationStatus.COMPLETED
    ) {
      throw new BusinessException(
        `No se puede modificar una reserva en estado ${reservation.status}`,
        'RESERVATION_NOT_EDITABLE',
      );
    }

    // Valores efectivos tras aplicar el cambio.
    const nextDate = dto.date ?? reservation.date;
    const nextTime = dto.time ?? reservation.time;
    const nextPartySize = dto.partySize ?? reservation.partySize;
    const tableProvided = dto.tableId !== undefined;
    const nextTableId = tableProvided ? dto.tableId! : reservation.tableId;

    if (dto.date !== undefined) this.validateDate(nextDate);
    if (dto.time !== undefined) this.validateSlot(nextTime);

    // Si cambia algo que afecta la ocupación de mesa, revalidar disponibilidad.
    const occupancyChanged =
      dto.date !== undefined ||
      dto.time !== undefined ||
      dto.partySize !== undefined ||
      tableProvided;

    if (occupancyChanged && nextTableId !== null) {
      const table = this.tablesService.findOne(nextTableId);
      if (table.capacity < nextPartySize) {
        throw new BusinessException(
          `La mesa ${table.label} (capacidad ${table.capacity}) no admite ${nextPartySize} comensales`,
          'TABLE_CAPACITY_EXCEEDED',
        );
      }
      if (this.isTableBooked(nextTableId, nextDate, nextTime, id)) {
        throw new BusinessException(
          `La mesa ${table.label} ya está reservada el ${nextDate} a las ${nextTime}`,
          'DOUBLE_BOOKING',
          HttpStatus.CONFLICT,
        );
      }
    }

    if (dto.status !== undefined) {
      this.validateStatusTransition(reservation.status, dto.status);
      reservation.status = dto.status;
    }

    reservation.customerName = dto.customerName ?? reservation.customerName;
    reservation.customerEmail = dto.customerEmail ?? reservation.customerEmail;
    reservation.customerPhone = dto.customerPhone ?? reservation.customerPhone;
    reservation.date = nextDate;
    reservation.time = nextTime;
    reservation.partySize = nextPartySize;
    reservation.tableId = nextTableId;
    reservation.updatedAt = new Date().toISOString();

    return reservation;
  }

  /** Cancela una reserva (cambia su estado a CANCELLED). */
  cancel(id: string): Reservation {
    const reservation = this.findOne(id);
    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BusinessException(
        'La reserva ya estaba cancelada',
        'ALREADY_CANCELLED',
      );
    }
    if (reservation.status === ReservationStatus.COMPLETED) {
      throw new BusinessException(
        'No se puede cancelar una reserva completada',
        'RESERVATION_NOT_EDITABLE',
      );
    }
    reservation.status = ReservationStatus.CANCELLED;
    reservation.updatedAt = new Date().toISOString();
    return reservation;
  }

  /**
   * Devuelve los ids de mesa ocupados en una fecha y franja (reservas
   * activas, es decir no canceladas). Usado por TablesService.
   */
  getBookedTableIds(
    date: string,
    time: string,
    excludeReservationId?: string,
  ): number[] {
    return this.reservations
      .filter(
        (r) =>
          r.id !== excludeReservationId &&
          r.date === date &&
          r.time === time &&
          r.status !== ReservationStatus.CANCELLED &&
          r.tableId !== null,
      )
      .map((r) => r.tableId as number);
  }

  // --- Helpers privados de reglas de negocio ---

  private isTableBooked(
    tableId: number,
    date: string,
    time: string,
    excludeReservationId?: string,
  ): boolean {
    return this.getBookedTableIds(date, time, excludeReservationId).includes(
      tableId,
    );
  }

  private validateSlot(time: string): void {
    if (!isValidSlot(time)) {
      throw new BusinessException(
        `La franja ${time} no es válida. Use franjas de 30 min entre 12:00-15:00 o 19:00-23:00`,
        'INVALID_TIME_SLOT',
      );
    }
  }

  private validateDate(date: string): void {
    // Interpreta la fecha como día calendario (sin zona horaria).
    const target = new Date(`${date}T00:00:00`);
    if (Number.isNaN(target.getTime())) {
      throw new BusinessException(
        `La fecha ${date} no es válida`,
        'INVALID_DATE',
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const max = new Date(today);
    max.setDate(max.getDate() + MAX_DAYS_AHEAD);

    if (target.getTime() < today.getTime()) {
      throw new BusinessException(
        'No se permiten reservas en fechas pasadas',
        'DATE_IN_PAST',
      );
    }
    if (target.getTime() > max.getTime()) {
      throw new BusinessException(
        `Solo se permiten reservas hasta ${MAX_DAYS_AHEAD} días en el futuro`,
        'DATE_OUT_OF_RANGE',
      );
    }
  }

  private validateStatusTransition(
    from: ReservationStatus,
    to: ReservationStatus,
  ): void {
    if (from === to) return;
    const allowed = STATUS_TRANSITIONS[from];
    if (!allowed.includes(to)) {
      throw new BusinessException(
        `Transición de estado inválida: ${from} → ${to}`,
        'INVALID_STATUS_TRANSITION',
      );
    }
  }
}
