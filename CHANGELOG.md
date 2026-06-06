# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).
Versionado según [SemVer](https://semver.org/lang/es/).

---

## [1.0.0] - 2026-06-06

### Sprint 4 — Entregable Final: Pruebas, Documentación y Despliegue

#### Añadido
- **Frontend Next.js 14** con App Router, TypeScript strict y SCSS modules.
- Páginas: Home, Nueva Reserva (form + disponibilidad en vivo), 
  Lista de Reservas (filtros, badges, acciones) y Detalle (timeline de estados).
- Sistema de diseño SCSS completo (`_variables`, `_mixins`, `_reset`, `globals`).
- Cliente API tipado con Axios (`lib/api/`), manejo de errores `{ statusCode, 
  message, errorCode }`.
- `docs/plan-de-pruebas.md`: 16 casos de prueba con evidencias y cobertura 94.05%.
- `docs/manual-usuario.md`: guía de uso de los 8 endpoints con ejemplos curl.
- `docs/tech-stack.md`: arquitectura, justificación de tecnologías y API First.
- `docs/gestion-post-proyecto.md`: SLA, plan de mantenimiento, SemVer, KPIs.
- `docs/test-results.md`: resultados verificados de las 33 pruebas automatizadas.
- `.github/PULL_REQUEST_TEMPLATE.md` y `.github/ISSUE_TEMPLATE/bug_report.md`.
- `CHANGELOG.md` (este archivo).

#### Modificado
- `README.md`: actualizado con tabla de endpoints, instalación, estructura 
  del proyecto y enlaces a toda la documentación.
- `tsconfig.json`: añadido `esModuleInterop` y `allowSyntheticDefaultImports`
  para compatibilidad de Supertest en pruebas e2e.

#### Corregido
- **DEF-01:** pruebas e2e fallaban al importar `supertest`; resuelto con 
  `esModuleInterop: true` en `tsconfig.json`.
- **DEF-02:** errores de dominio devolvían HTTP 500; resuelto con 
  `BusinessException` y filtro global que mapea a 400/409 con `errorCode`.

---

## [0.3.0] - 2026-05-21

### Sprint 3 — Mejoras, Pruebas y Frontend Inicial

#### Añadido
- 19 pruebas unitarias para `ReservationsService` (cobertura 94.05%).
- 6 pruebas de controlador para `ReservationsController`.
- 8 pruebas e2e en `test/app.e2e-spec.ts` con Supertest.
- Scaffold del frontend con Next.js 14 y sistema de diseño SCSS.
- Componentes base: `Button`, `Badge`, `Modal`, `LoadingSpinner`.

#### Corregido
- DEF-01 y DEF-02 identificados y resueltos durante esta fase.

---

## [0.2.0] - 2026-05-06

### Sprint 2 — Primer Plato: Core API

#### Añadido
- `ReservationEntity` con enum de estados 
  (`PENDING → CONFIRMED → SEATED → COMPLETED | CANCELLED`).
- `CreateReservationDto` y `UpdateReservationDto` con class-validator.
- `ReservationsService`: lógica de negocio completa (doble reserva, franjas 
  horarias, ventana de 30 días, asignación automática de mesa).
- `ReservationsController`: endpoints CRUD completos (5 rutas).
- `TablesModule`: listado de mesas y consulta de disponibilidad.
- `HealthModule`: endpoint `/health`.
- Swagger UI en `/api/docs` y contrato `swagger.yaml`.

---

## [0.1.0] - 2026-04-18

### Sprint 1 — Fundación

#### Añadido
- Proyecto NestJS 14 inicializado con TypeScript strict.
- Estructura de módulos: `src/modules/`, `src/common/`.
- `AppModule` con `ValidationPipe` global y CORS habilitado.
- `BusinessException` y `HttpExceptionFilter` global.
- `README.md` inicial con descripción del proyecto.
- `.env.example` y `.gitignore` configurados.

---

[1.0.0]: https://github.com/yonny-147/restaurante-reservas/releases/tag/v1.0.0
[0.3.0]: https://github.com/yonny-147/restaurante-reservas/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/yonny-147/restaurante-reservas/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/yonny-147/restaurante-reservas/releases/tag/v0.1.0
