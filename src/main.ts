import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // CORS habilitado (configurable por env CORS_ORIGIN).
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
  });

  // Prefijo global opcional.
  const prefix = process.env.API_PREFIX;
  if (prefix) {
    app.setGlobalPrefix(prefix);
  }

  // Validación global de DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Filtro de excepciones e interceptor de logging globales.
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // --- Configuración de Swagger / OpenAPI 3.0 (API First) ---
  const config = new DocumentBuilder()
    .setTitle('API de Reservas de Restaurante')
    .setDescription(
      'Sistema de reservas de restaurante construido con NestJS siguiendo un enfoque API First. ' +
        'Permite gestionar reservas, mesas y verificar el estado del sistema.',
    )
    .setVersion('1.0.0')
    .addTag('reservations', 'Gestión de reservas')
    .addTag('tables', 'Consulta de mesas y disponibilidad')
    .addTag('health', 'Estado del sistema')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 Aplicación corriendo en http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`📚 Swagger UI disponible en http://localhost:${port}/api/docs`);
}

bootstrap();
