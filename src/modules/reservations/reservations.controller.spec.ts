import { Test, TestingModule } from '@nestjs/testing';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

function dateFromToday(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const sampleDto: CreateReservationDto = {
  customerName: 'Ana Gómez',
  customerEmail: 'ana@example.com',
  customerPhone: '+57 3009998877',
  date: dateFromToday(3),
  time: '12:30',
  partySize: 2,
};

const sampleReservation: Reservation = {
  id: 'uuid-1',
  ...sampleDto,
  tableId: 1,
  status: ReservationStatus.PENDING,
  createdAt: '2026-06-06T00:00:00.000Z',
  updatedAt: '2026-06-06T00:00:00.000Z',
};

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: jest.Mocked<ReservationsService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<ReservationsService>> = {
      create: jest.fn().mockReturnValue(sampleReservation),
      findAll: jest.fn().mockReturnValue([sampleReservation]),
      findOne: jest.fn().mockReturnValue(sampleReservation),
      update: jest
        .fn()
        .mockReturnValue({ ...sampleReservation, status: ReservationStatus.CONFIRMED }),
      cancel: jest
        .fn()
        .mockReturnValue({ ...sampleReservation, status: ReservationStatus.CANCELLED }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [{ provide: ReservationsService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get(ReservationsService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('POST /reservations delega en service.create', () => {
    const res = controller.create(sampleDto);
    expect(service.create).toHaveBeenCalledWith(sampleDto);
    expect(res).toEqual(sampleReservation);
  });

  it('GET /reservations delega en service.findAll con filtros', () => {
    const query = { status: ReservationStatus.PENDING };
    const res = controller.findAll(query);
    expect(service.findAll).toHaveBeenCalledWith(query);
    expect(res).toHaveLength(1);
  });

  it('GET /reservations/:id delega en service.findOne', () => {
    const res = controller.findOne('uuid-1');
    expect(service.findOne).toHaveBeenCalledWith('uuid-1');
    expect(res.id).toBe('uuid-1');
  });

  it('PATCH /reservations/:id delega en service.update', () => {
    const res = controller.update('uuid-1', { status: ReservationStatus.CONFIRMED });
    expect(service.update).toHaveBeenCalledWith('uuid-1', {
      status: ReservationStatus.CONFIRMED,
    });
    expect(res.status).toBe(ReservationStatus.CONFIRMED);
  });

  it('DELETE /reservations/:id delega en service.cancel', () => {
    const res = controller.cancel('uuid-1');
    expect(service.cancel).toHaveBeenCalledWith('uuid-1');
    expect(res.status).toBe(ReservationStatus.CANCELLED);
  });
});
