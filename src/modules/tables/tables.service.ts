import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { ReservationsService } from '../reservations/reservations.service';
import { isValidSlot } from '../../common/constants/time-slots';
import { BusinessException } from '../../common/exceptions/business.exception';
import { Table, TableLocation } from './entities/table.entity';

/**
 * Servicio de mesas.
 *
 * Mantiene el catálogo de mesas en memoria y resuelve consultas de
 * disponibilidad combinando el catálogo con las reservas existentes.
 * Depende de ReservationsService (con forwardRef por dependencia circular).
 */
@Injectable()
export class TablesService {
  private readonly tables: Table[] = [
    { id: 1, label: 'A1', capacity: 2, location: TableLocation.INDOOR },
    { id: 2, label: 'A2', capacity: 2, location: TableLocation.INDOOR },
    { id: 3, label: 'B1', capacity: 4, location: TableLocation.INDOOR },
    { id: 4, label: 'B2', capacity: 4, location: TableLocation.TERRACE },
    { id: 5, label: 'C1', capacity: 6, location: TableLocation.OUTDOOR },
    { id: 6, label: 'C2', capacity: 6, location: TableLocation.TERRACE },
    { id: 7, label: 'P1', capacity: 10, location: TableLocation.PRIVATE },
    { id: 8, label: 'P2', capacity: 20, location: TableLocation.PRIVATE },
  ];

  constructor(
    @Inject(forwardRef(() => ReservationsService))
    private readonly reservationsService: ReservationsService,
  ) {}

  /** Devuelve todas las mesas del restaurante. */
  findAll(): Table[] {
    return [...this.tables];
  }

  /** Busca una mesa por id; lanza 404 si no existe. */
  findOne(id: number): Table {
    const table = this.tables.find((t) => t.id === id);
    if (!table) {
      throw new NotFoundException(`La mesa con id ${id} no existe`);
    }
    return table;
  }

  /** Indica si existe la mesa sin lanzar excepción. */
  exists(id: number): boolean {
    return this.tables.some((t) => t.id === id);
  }

  /**
   * Devuelve las mesas libres en una fecha y franja horaria.
   * Valida que la franja horaria sea válida antes de consultar.
   */
  findAvailable(date: string, time: string): Table[] {
    if (!isValidSlot(time)) {
      throw new BusinessException(
        `La franja ${time} no es válida. Use franjas de 30 min entre 12:00-15:00 o 19:00-23:00`,
        'INVALID_TIME_SLOT',
      );
    }
    const bookedIds = this.reservationsService.getBookedTableIds(date, time);
    return this.tables.filter((t) => !bookedIds.includes(t.id));
  }

  /**
   * Selecciona automáticamente una mesa libre que admita el tamaño del
   * grupo, eligiendo la de menor capacidad suficiente. Devuelve null si
   * no hay ninguna disponible.
   */
  findBestAvailable(
    date: string,
    time: string,
    partySize: number,
  ): Table | null {
    const candidates = this.findAvailable(date, time)
      .filter((t) => t.capacity >= partySize)
      .sort((a, b) => a.capacity - b.capacity);
    return candidates[0] ?? null;
  }
}
