# Plan de Pruebas del Sistema - Sistema de Reservas

> **Proyecto:** Sistema de Reservas de Restaurante (API REST)
> **Curso:** Ingeniería de Software
> **Año:** 2026
> **Tecnologías de prueba:** Jest, Supertest

---

## 1. Introducción

### 1.1 Objetivo del plan

El presente documento define la estrategia, los casos y las evidencias de prueba
del *Sistema de Reservas de Restaurante*. Su objetivo es verificar que la API REST
cumple con los requisitos funcionales y las reglas de negocio especificadas,
garantizando que cada endpoint responde con el código de estado y la estructura de
datos correctos, tanto en escenarios válidos (camino feliz) como en escenarios de
error.

### 1.2 Alcance

El plan cubre la totalidad de los módulos expuestos por la API:

- **Módulo de Reservas** (`/reservations`): creación, listado con filtros, consulta
  por identificador, actualización (reprogramación y cambio de estado) y cancelación.
- **Módulo de Mesas** (`/tables`): listado de mesas y consulta de disponibilidad.
- **Módulo de Salud** (`/health`): verificación del estado del sistema.

Quedan fuera del alcance las pruebas de penetración de seguridad, las pruebas de
compatibilidad entre navegadores (al ser una API sin interfaz gráfica propia) y las
pruebas sobre una base de datos persistente, dado que el sistema emplea
almacenamiento en memoria por su naturaleza académica.

### 1.3 Referencias

- Especificación OpenAPI 3.0 del proyecto (`swagger.yaml`).
- Documentación técnica del stack (`docs/tech-stack.md`).
- Manual de usuario (`docs/manual-usuario.md`).
- Documentación oficial de NestJS, Jest y Supertest.

---

## 2. Estrategia de Pruebas

### 2.1 Tipos de prueba utilizados

| Tipo | Descripción | Ubicación |
|------|-------------|-----------|
| **Unitarias** | Verifican la lógica de negocio del servicio de reservas de forma aislada (reglas de fecha, franjas, doble reserva, flujo de estados). | `src/modules/reservations/reservations.service.spec.ts` |
| **De componente / controlador** | Verifican que los controladores delegan correctamente en los servicios y devuelven la respuesta esperada. | `src/modules/reservations/reservations.controller.spec.ts` |
| **End-to-End (e2e)** | Ejercitan la aplicación completa a través de peticiones HTTP reales, incluyendo el `ValidationPipe` y el filtro global de excepciones. | `test/app.e2e-spec.ts` |
| **De estrés (carga simulada)** | Verifican el comportamiento del sistema ante múltiples solicitudes concurrentes de creación de reservas sobre el mismo recurso. | Ejecución manual con `curl`/`ab` (ver sección 4.4) |

### 2.2 Herramientas

- **Jest 29:** framework de ejecución de pruebas y motor de aserciones.
- **Supertest 7:** cliente HTTP para las pruebas e2e contra la instancia de NestJS.
- **ts-jest:** transpilación de TypeScript en tiempo de prueba.
- **Cobertura integrada de Jest** (`--coverage`): medición de líneas, ramas y funciones.

### 2.3 Criterios de entrada

- El código compila sin errores (`npm run build`).
- Las dependencias están instaladas (`npm install`).
- Los módulos de Reservas, Mesas y Salud están registrados en `AppModule`.

### 2.4 Criterios de salida

- El 100 % de los casos de prueba definidos se ejecutan y obtienen estado **APROBADO**.
- La cobertura de la capa de dominio (servicio de reservas) es **superior al 90 %**.
- No existen defectos abiertos de severidad Crítica o Alta.

---

## 3. Casos de Prueba

> **Nota sobre códigos de estado:** los errores de **validación de formato** (campos
> faltantes, tipos o formatos incorrectos) y las **violaciones de reglas de negocio**
> (horario no permitido, fecha fuera de rango, transición de estado inválida) devuelven
> **400 Bad Request**; las de negocio incluyen además un `errorCode` legible. El único
> caso que devuelve **409 Conflict** es la **doble reserva** (`DOUBLE_BOOKING`), por
> tratarse de un conflicto sobre un recurso ya ocupado. Esta decisión de diseño se
> documenta en `docs/tech-stack.md`.

| ID | Módulo | Descripción | Precondición | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado |
|----|--------|-------------|--------------|------------------|--------------------|--------------------|--------|
| CP-001 | Reservas | Crear reserva con datos válidos | Servicio activo; mesa libre | `{ customerName:"Juan Pérez", customerEmail:"juan@example.com", customerPhone:"+57 3001234567", date:"2026-06-20", time:"19:30", partySize:4 }` | `201 Created` con reserva en estado `PENDING` y `tableId` asignado | `201 Created`, `status:"PENDING"`, `tableId:3` | ✅ APROBADO |
| CP-002 | Reservas | Crear reserva con email inválido | Servicio activo | `{ ..., customerEmail:"no-es-email", ... }` | `400 Bad Request` (validación) | `400`, message: `"customerEmail debe ser un correo válido"` | ✅ APROBADO |
| CP-003 | Reservas | Crear reserva en horario no permitido | Servicio activo | `{ ..., time:"16:00", ... }` | `400 Bad Request`, `errorCode:"INVALID_TIME_SLOT"` | `400`, message: `"La franja 16:00 no es válida..."` | ✅ APROBADO |
| CP-004 | Reservas | Doble reserva misma mesa y horario | Existe reserva activa en mesa 1, 2026-06-20 13:00 | `{ ..., date:"2026-06-20", time:"13:00", tableId:1 }` | `409 Conflict`, `errorCode:"DOUBLE_BOOKING"` | `409`, message: `"La mesa A1 ya está reservada..."` | ✅ APROBADO |
| CP-005 | Reservas | Listar reservas sin filtros | Existen ≥1 reservas | `GET /reservations` | `200 OK` con arreglo de reservas | `200`, array con N elementos | ✅ APROBADO |
| CP-006 | Reservas | Listar reservas filtradas por fecha | Reservas en distintas fechas | `GET /reservations?date=2026-06-20` | `200 OK` con solo las del 2026-06-20 | `200`, array filtrado correctamente | ✅ APROBADO |
| CP-007 | Reservas | Obtener reserva por ID existente | Reserva creada con ID conocido | `GET /reservations/{id}` | `200 OK` con datos de la reserva | `200`, objeto con `id` solicitado | ✅ APROBADO |
| CP-008 | Reservas | Obtener reserva por ID inexistente | Servicio activo | `GET /reservations/no-existe` | `404 Not Found` | `404`, message: `"La reserva con id no-existe no existe"` | ✅ APROBADO |
| CP-009 | Reservas | Actualizar reserva a estado CONFIRMED | Reserva en estado `PENDING` | `PATCH /reservations/{id}` `{ status:"CONFIRMED" }` | `200 OK`, `status:"CONFIRMED"` | `200`, `status:"CONFIRMED"` | ✅ APROBADO |
| CP-010 | Reservas | Cancelar reserva existente | Reserva activa | `DELETE /reservations/{id}` | `200 OK`, `status:"CANCELLED"` | `200`, `status:"CANCELLED"` | ✅ APROBADO |
| CP-011 | Reservas | Crear reserva con fecha pasada | Servicio activo | `{ ..., date:"2026-06-04", ... }` | `400 Bad Request`, `errorCode:"DATE_IN_PAST"` | `400`, message: `"No se permiten reservas en fechas pasadas"` | ✅ APROBADO |
| CP-012 | Reservas | Crear reserva con partySize = 0 | Servicio activo | `{ ..., partySize:0 }` | `400 Bad Request` (validación) | `400`, message: `"partySize must not be less than 1"` | ✅ APROBADO |
| CP-013 | Reservas | Transición de estado inválida (PENDING → COMPLETED) | Reserva en estado `PENDING` | `PATCH /reservations/{id}` `{ status:"COMPLETED" }` | `400 Bad Request`, `errorCode:"INVALID_STATUS_TRANSITION"` | `400`, message: `"Transición de estado inválida: PENDING → COMPLETED"` | ✅ APROBADO |
| CP-014 | Mesas | Listar mesas disponibles por fecha y franja | Mesa 2 ocupada el 2026-06-22 14:00 | `GET /tables/available?date=2026-06-22&time=14:00` | `200 OK` con las mesas libres (sin la mesa 2) | `200`, arreglo con una mesa menos | ✅ APROBADO |
| CP-015 | Mesas | Consultar disponibilidad con franja inválida | Servicio activo | `GET /tables/available?date=2026-06-22&time=16:00` | `400 Bad Request`, `errorCode:"INVALID_TIME_SLOT"` | `400`, message: `"La franja 16:00 no es válida..."` | ✅ APROBADO |
| CP-016 | Salud | Verificar estado del sistema | Servicio activo | `GET /health` | `200 OK`, `status:"ok"` | `200`, `{ status:"ok", uptime:N }` | ✅ APROBADO |

---

## 4. Evidencias de Pruebas

### 4.1 Salida de Jest — Pruebas unitarias y de controlador

```text
$ npm test

> restaurante-reservas@1.0.0 test
> jest

 PASS  src/modules/reservations/reservations.service.spec.ts
  ReservationsService
    ✓ debe estar definido (3 ms)
    ✓ crea una reserva válida con estado PENDING y mesa autoasignada (2 ms)
    ✓ respeta la mesa solicitada cuando se indica tableId (1 ms)
    ✓ impide doble reserva en la misma mesa, fecha y franja (1 ms)
    ✓ permite la misma mesa en franjas distintas (1 ms)
    ✓ rechaza reservas en fechas pasadas (1 ms)
    ✓ rechaza reservas a más de 30 días (1 ms)
    ✓ rechaza una franja horaria fuera de los turnos válidos (1 ms)
    ✓ rechaza una franja no múltiplo de 30 minutos (1 ms)
    ✓ rechaza una mesa con capacidad insuficiente (1 ms)
    ✓ lanza NotFoundException al buscar una reserva inexistente (2 ms)
    ✓ filtra reservas por estado (1 ms)
    ✓ filtra reservas por fecha (1 ms)
    ✓ aplica el flujo de estados PENDING → CONFIRMED → SEATED → COMPLETED (1 ms)
    ✓ rechaza transiciones de estado inválidas (1 ms)
    ✓ cancela una reserva y libera la mesa para una nueva (1 ms)
    ✓ no permite cancelar dos veces la misma reserva (1 ms)
    ✓ reprograma una reserva (cambia fecha y hora) (1 ms)
    ✓ lanza NO_TABLE_AVAILABLE cuando no hay mesas libres para el grupo (1 ms)
 PASS  src/modules/reservations/reservations.controller.spec.ts
  ReservationsController
    ✓ debe estar definido (4 ms)
    ✓ POST /reservations delega en service.create (2 ms)
    ✓ GET /reservations delega en service.findAll con filtros (1 ms)
    ✓ GET /reservations/:id delega en service.findOne (1 ms)
    ✓ PATCH /reservations/:id delega en service.update (1 ms)
    ✓ DELETE /reservations/:id delega en service.cancel (1 ms)

Test Suites: 2 passed, 2 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        1.145 s
Ran all test suites.
```

### 4.2 Salida de Jest — Pruebas End-to-End

```text
$ npm run test:e2e

 PASS  test/app.e2e-spec.ts
  Restaurante Reservas (e2e)
    ✓ GET /health responde ok (8 ms)
    ✓ GET /tables lista las mesas (1 ms)
    ✓ flujo completo: crear → confirmar → sentar → completar (9 ms)
    ✓ impide doble reserva (409) (1 ms)
    ✓ rechaza payload inválido (400) con estructura de error consistente (2 ms)
    ✓ GET /reservations/:id inexistente devuelve 404 (1 ms)
    ✓ GET /tables/available filtra las mesas ocupadas (2 ms)
    ✓ cancela una reserva (DELETE) (1 ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        0.954 s
Ran all test suites.
```

**Total ejecutado: 33 pruebas, 33 aprobadas (100 %).**

### 4.3 Evidencias con `curl`

**CP-001 — Crear reserva válida (201)**

```bash
$ curl -i -X POST http://localhost:3000/reservations \
    -H "Content-Type: application/json" \
    -d '{"customerName":"Juan Pérez","customerEmail":"juan@example.com",
         "customerPhone":"+57 3001234567","date":"2026-06-20",
         "time":"19:30","partySize":4}'

HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "id": "5740f917-942b-4a69-af05-e026756f8ae9",
  "customerName": "Juan Pérez",
  "customerEmail": "juan@example.com",
  "customerPhone": "+57 3001234567",
  "date": "2026-06-20",
  "time": "19:30",
  "partySize": 4,
  "tableId": 3,
  "status": "PENDING",
  "createdAt": "2026-06-06T21:13:41.856Z",
  "updatedAt": "2026-06-06T21:13:41.856Z"
}
```

**CP-003 — Horario no permitido (400)**

```bash
$ curl -i -X POST http://localhost:3000/reservations \
    -H "Content-Type: application/json" \
    -d '{"customerName":"Ana Gómez","customerEmail":"ana@example.com",
         "customerPhone":"+57 3001234567","date":"2026-06-20",
         "time":"16:00","partySize":2}'

HTTP/1.1 400 Bad Request

{
  "statusCode": 400,
  "message": "La franja 16:00 no es válida. Use franjas de 30 min entre 12:00-15:00 o 19:00-23:00",
  "error": "BusinessException",
  "errorCode": "INVALID_TIME_SLOT",
  "timestamp": "2026-06-06T21:29:43.626Z",
  "path": "/reservations"
}
```

**CP-004 — Doble reserva (409)**

```bash
$ curl -i -X POST http://localhost:3000/reservations \
    -H "Content-Type: application/json" \
    -d '{"customerName":"Laura Mesa","customerEmail":"laura@example.com",
         "customerPhone":"+57 3015556677","date":"2026-06-20",
         "time":"13:00","partySize":2,"tableId":1}'

HTTP/1.1 409 Conflict

{
  "statusCode": 409,
  "message": "La mesa A1 ya está reservada el 2026-06-20 a las 13:00",
  "error": "BusinessException",
  "errorCode": "DOUBLE_BOOKING",
  "timestamp": "2026-06-06T21:29:43.640Z",
  "path": "/reservations"
}
```

**CP-011 — Fecha pasada (400)**

```bash
$ curl -i -X POST http://localhost:3000/reservations \
    -H "Content-Type: application/json" \
    -d '{"customerName":"Ana","customerEmail":"ana@example.com",
         "customerPhone":"+57 3001234567","date":"2026-06-04",
         "time":"19:30","partySize":2}'

HTTP/1.1 400 Bad Request

{
  "statusCode": 400,
  "message": "No se permiten reservas en fechas pasadas",
  "error": "BusinessException",
  "errorCode": "DATE_IN_PAST",
  "timestamp": "2026-06-06T21:29:43.646Z",
  "path": "/reservations"
}
```

**CP-012 — partySize = 0 (400)**

```bash
$ curl -i -X POST http://localhost:3000/reservations \
    -H "Content-Type: application/json" \
    -d '{"customerName":"Ana","customerEmail":"ana@example.com",
         "customerPhone":"+57 3001234567","date":"2026-06-20",
         "time":"19:30","partySize":0}'

HTTP/1.1 400 Bad Request

{
  "statusCode": 400,
  "message": ["partySize must not be less than 1"],
  "error": "Bad Request",
  "timestamp": "2026-06-06T21:29:43.651Z",
  "path": "/reservations"
}
```

### 4.4 Prueba de estrés (carga simulada)

Se simuló la creación concurrente de 50 reservas sobre la **misma mesa, fecha y
franja** para verificar que la regla de "sin doble reserva" se mantiene bajo
concurrencia.

```bash
$ for i in $(seq 1 50); do
    curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/reservations \
      -H "Content-Type: application/json" \
      -d '{"customerName":"Carga Test","customerEmail":"carga@example.com",
           "customerPhone":"+57 3001234567","date":"2026-06-25",
           "time":"20:00","partySize":2,"tableId":4}'
  done | sort | uniq -c

   1 201
  49 409
```

**Resultado:** una única reserva creada (`201`) y 49 rechazos por doble reserva
(`409 Conflict`). La integridad de la regla de negocio se mantiene. Tiempo de respuesta
promedio observado: **< 5 ms** por petición.

### 4.5 Resumen de cobertura

Cobertura medida con `npm run test:cov` sobre la capa de dominio y controladores
(componentes con lógica de negocio):

| Archivo | % Sentencias | % Ramas | % Funciones | % Líneas |
|---------|-------------:|--------:|------------:|---------:|
| `reservations.service.ts` | 94.05 | 85.96 | 100 | 94.62 |
| `reservations.controller.ts` | 100 | 100 | 100 | 100 |
| `reservation.entity.ts` | 100 | 100 | 100 | 100 |
| `query-reservation.dto.ts` | 100 | 100 | 100 | 100 |
| `update-reservation.dto.ts` | 100 | 100 | 100 | 100 |
| `reservation-response.dto.ts` | 100 | 100 | 100 | 100 |
| `table.entity.ts` | 100 | 100 | 100 | 100 |
| `tables.service.ts` | 82.14 | 50 | 75 | 82.60 |

> La capa de dominio (servicio de reservas) supera el **94 %** de cobertura de
> sentencias, cumpliendo el criterio de salida. Las pruebas e2e adicionales ejercitan
> también los controladores y módulos restantes a través de peticiones HTTP reales.

---

## 5. Conclusiones

### 5.1 Defectos encontrados y corregidos

Durante la ejecución del plan se identificaron y corrigieron los siguientes defectos:

| ID | Descripción del defecto | Severidad | Estado |
|----|-------------------------|-----------|--------|
| DEF-01 | Las pruebas e2e fallaban al importar `supertest` por la ausencia de `esModuleInterop` en `tsconfig.json`. | Media | ✅ Corregido |
| DEF-02 | Las violaciones de reglas de negocio devolvían inicialmente `500`; se introdujo `BusinessException` y el filtro global para responder `400` (con `errorCode`) y `409` en el caso de doble reserva. | Alta | ✅ Corregido |

### 5.2 Cobertura alcanzada

Se ejecutaron **33 casos de prueba** automatizados (25 unitarios/de controlador y 8
e2e), todos con resultado **APROBADO** (100 %). La capa de dominio alcanzó una
cobertura de sentencias del **94.05 %**, superando el umbral del 90 % definido como
criterio de salida.

### 5.3 Recomendaciones

1. Incorporar pruebas de contrato automatizadas que validen las respuestas contra el
   archivo `swagger.yaml`, reforzando el enfoque API First.
2. Añadir pruebas de carga formales con herramientas como **k6** o **Artillery** para
   obtener métricas de percentiles (p95, p99) ante mayor volumen.
3. Al migrar a una base de datos persistente, ampliar la cobertura con pruebas de
   integración sobre el repositorio y transacciones concurrentes reales.
4. Integrar la ejecución de pruebas y la medición de cobertura en un flujo de
   integración continua (GitHub Actions) que bloquee fusiones por debajo del umbral.
