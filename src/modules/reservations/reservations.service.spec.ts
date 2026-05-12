import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BusinessException } from '../../common/exceptions/business.exception';
import { TablesService } from '../tables/tables.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationStatus } from './entities/reservation.entity';
import { ReservationsService } from './reservations.service';

/** Devuelve una fecha YYYY-MM-DD desplazada `days` días desde hoy. */
function dateFromToday(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const baseDto = (overrides: Partial<CreateReservationDto> = {}): CreateReservationDto => ({
  customerName: 'Juan Pérez',
  customerEmail: 'juan.perez@example.com',
  customerPhone: '+57 3001234567',
  date: dateFromToday(5),
  time: '19:30',
  partySize: 2,
  ...overrides,
});

describe('ReservationsService', () => {
  let service: ReservationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReservationsService, TablesService],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // 1
  it('crea una reserva válida con estado PENDING y mesa autoasignada', () => {
    const res = service.create(baseDto());
    expect(res.id).toBeDefined();
    expect(res.status).toBe(ReservationStatus.PENDING);
    expect(res.tableId).not.toBeNull();
    expect(res.createdAt).toBeDefined();
  });

  // 2
  it('respeta la mesa solicitada cuando se indica tableId', () => {
    const res = service.create(baseDto({ tableId: 3, partySize: 4 }));
    expect(res.tableId).toBe(3);
  });

  // 3
  it('impide doble reserva en la misma mesa, fecha y franja', () => {
    const date = dateFromToday(6);
    service.create(baseDto({ tableId: 3, partySize: 4, date }));
    expect(() =>
      service.create(baseDto({ tableId: 3, partySize: 4, date })),
    ).toThrow(BusinessException);
  });

  // 4
  it('permite la misma mesa en franjas distintas', () => {
    const date = dateFromToday(7);
    service.create(baseDto({ tableId: 3, partySize: 4, date, time: '19:00' }));
    const res = service.create(
      baseDto({ tableId: 3, partySize: 4, date, time: '19:30' }),
    );
    expect(res.tableId).toBe(3);
  });

  // 5
  it('rechaza reservas en fechas pasadas', () => {
    expect(() => service.create(baseDto({ date: dateFromToday(-1) }))).toThrow(
      BusinessException,
    );
  });

  // 6
  it('rechaza reservas a más de 30 días', () => {
    expect(() => service.create(baseDto({ date: dateFromToday(31) }))).toThrow(
      BusinessException,
    );
  });

  // 7
  it('rechaza una franja horaria fuera de los turnos válidos', () => {
    expect(() => service.create(baseDto({ time: '16:00' }))).toThrow(
      BusinessException,
    );
  });

  // 8
  it('rechaza una franja no múltiplo de 30 minutos', () => {
    expect(() => service.create(baseDto({ time: '19:15' }))).toThrow(
      BusinessException,
    );
  });

  // 9
  it('rechaza una mesa con capacidad insuficiente', () => {
    // Mesa 1 tiene capacidad 2.
    expect(() => service.create(baseDto({ tableId: 1, partySize: 5 }))).toThrow(
      BusinessException,
    );
  });

  // 10
  it('lanza NotFoundException al buscar una reserva inexistente', () => {
    expect(() => service.findOne('no-existe')).toThrow(NotFoundException);
  });

  // 11
  it('filtra reservas por estado', () => {
    const r1 = service.create(baseDto({ tableId: 1 }));
    service.create(baseDto({ tableId: 2 }));
    service.update(r1.id, { status: ReservationStatus.CONFIRMED });

    const confirmadas = service.findAll({ status: ReservationStatus.CONFIRMED });
    expect(confirmadas).toHaveLength(1);
    expect(confirmadas[0].id).toBe(r1.id);
  });

  // 12
  it('filtra reservas por fecha', () => {
    const d1 = dateFromToday(8);
    const d2 = dateFromToday(9);
    service.create(baseDto({ tableId: 1, date: d1 }));
    service.create(baseDto({ tableId: 2, date: d2 }));
    expect(service.findAll({ date: d1 })).toHaveLength(1);
  });

  // 13
  it('aplica el flujo de estados PENDING → CONFIRMED → SEATED → COMPLETED', () => {
    const r = service.create(baseDto());
    expect(service.update(r.id, { status: ReservationStatus.CONFIRMED }).status).toBe(
      ReservationStatus.CONFIRMED,
    );
    expect(service.update(r.id, { status: ReservationStatus.SEATED }).status).toBe(
      ReservationStatus.SEATED,
    );
    expect(service.update(r.id, { status: ReservationStatus.COMPLETED }).status).toBe(
      ReservationStatus.COMPLETED,
    );
  });

  // 14
  it('rechaza transiciones de estado inválidas', () => {
    const r = service.create(baseDto());
    expect(() =>
      service.update(r.id, { status: ReservationStatus.COMPLETED }),
    ).toThrow(BusinessException);
  });

  // 15
  it('cancela una reserva y libera la mesa para una nueva', () => {
    const date = dateFromToday(10);
    const r = service.create(baseDto({ tableId: 5, partySize: 6, date }));
    const cancelled = service.cancel(r.id);
    expect(cancelled.status).toBe(ReservationStatus.CANCELLED);
    // La mesa vuelve a estar libre.
    const r2 = service.create(baseDto({ tableId: 5, partySize: 6, date }));
    expect(r2.tableId).toBe(5);
  });

  // 16
  it('no permite cancelar dos veces la misma reserva', () => {
    const r = service.create(baseDto());
    service.cancel(r.id);
    expect(() => service.cancel(r.id)).toThrow(BusinessException);
  });

  // 17
  it('reprograma una reserva (cambia fecha y hora)', () => {
    const r = service.create(baseDto({ tableId: 4, partySize: 4 }));
    const updated = service.update(r.id, { date: dateFromToday(11), time: '20:00' });
    expect(updated.time).toBe('20:00');
    expect(updated.date).toBe(dateFromToday(11));
  });

  // 18
  it('lanza NO_TABLE_AVAILABLE cuando no hay mesas libres para el grupo', () => {
    const date = dateFromToday(12);
    const time = '12:00';
    // Solo hay una mesa de capacidad 20 (id 8). La ocupamos.
    service.create(baseDto({ tableId: 8, partySize: 20, date, time }));
    expect(() =>
      service.create(baseDto({ partySize: 20, date, time })),
    ).toThrow(BusinessException);
  });
});
