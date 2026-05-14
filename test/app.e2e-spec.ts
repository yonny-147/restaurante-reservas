import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

function dateFromToday(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

describe('Restaurante Reservas (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health responde ok', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
      });
  });

  it('GET /tables lista las mesas', () => {
    return request(app.getHttpServer())
      .get('/tables')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('flujo completo: crear → confirmar → sentar → completar', async () => {
    const date = dateFromToday(4);
    const payload = {
      customerName: 'Carlos Ruiz',
      customerEmail: 'carlos@example.com',
      customerPhone: '+57 3012223344',
      date,
      time: '20:00',
      partySize: 4,
      tableId: 3,
    };

    // Crear
    const created = await request(app.getHttpServer())
      .post('/reservations')
      .send(payload)
      .expect(201);
    const id = created.body.id;
    expect(created.body.status).toBe('PENDING');

    // Confirmar
    await request(app.getHttpServer())
      .patch(`/reservations/${id}`)
      .send({ status: 'CONFIRMED' })
      .expect(200)
      .expect((res) => expect(res.body.status).toBe('CONFIRMED'));

    // Sentar
    await request(app.getHttpServer())
      .patch(`/reservations/${id}`)
      .send({ status: 'SEATED' })
      .expect(200);

    // Completar
    await request(app.getHttpServer())
      .patch(`/reservations/${id}`)
      .send({ status: 'COMPLETED' })
      .expect(200)
      .expect((res) => expect(res.body.status).toBe('COMPLETED'));
  });

  it('impide doble reserva (409)', async () => {
    const date = dateFromToday(5);
    const payload = {
      customerName: 'Laura Mesa',
      customerEmail: 'laura@example.com',
      customerPhone: '+57 3015556677',
      date,
      time: '13:00',
      partySize: 2,
      tableId: 1,
    };
    await request(app.getHttpServer()).post('/reservations').send(payload).expect(201);
    await request(app.getHttpServer())
      .post('/reservations')
      .send(payload)
      .expect(409)
      .expect((res) => expect(res.body.errorCode).toBe('DOUBLE_BOOKING'));
  });

  it('rechaza payload inválido (400) con estructura de error consistente', () => {
    return request(app.getHttpServer())
      .post('/reservations')
      .send({ customerName: 'X', customerEmail: 'no-es-email', date: 'mal' })
      .expect(400)
      .expect((res) => {
        expect(res.body).toHaveProperty('statusCode', 400);
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('error');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('path');
      });
  });

  it('GET /reservations/:id inexistente devuelve 404', () => {
    return request(app.getHttpServer())
      .get('/reservations/no-existe')
      .expect(404);
  });

  it('GET /tables/available filtra las mesas ocupadas', async () => {
    const date = dateFromToday(6);
    const time = '14:00';
    const before = await request(app.getHttpServer())
      .get('/tables/available')
      .query({ date, time })
      .expect(200);
    const countBefore = before.body.length;

    await request(app.getHttpServer())
      .post('/reservations')
      .send({
        customerName: 'Pedro Sol',
        customerEmail: 'pedro@example.com',
        customerPhone: '+57 3001112233',
        date,
        time,
        partySize: 2,
        tableId: 2,
      })
      .expect(201);

    const after = await request(app.getHttpServer())
      .get('/tables/available')
      .query({ date, time })
      .expect(200);
    expect(after.body.length).toBe(countBefore - 1);
  });

  it('cancela una reserva (DELETE)', async () => {
    const date = dateFromToday(7);
    const created = await request(app.getHttpServer())
      .post('/reservations')
      .send({
        customerName: 'Marta Lía',
        customerEmail: 'marta@example.com',
        customerPhone: '+57 3009990011',
        date,
        time: '19:30',
        partySize: 2,
        tableId: 1,
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/reservations/${created.body.id}`)
      .expect(200)
      .expect((res) => expect(res.body.status).toBe('CANCELLED'));
  });
});
