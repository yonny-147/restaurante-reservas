# Documentación Técnica - Stack Tecnológico

> **Proyecto:** Sistema de Reservas de Restaurante (API REST)
> **Curso:** Ingeniería de Software
> **Año:** 2026

---

## 1. Descripción General de la Arquitectura

El sistema implementa una **API REST** bajo una **arquitectura modular** propia del
framework NestJS. Cada dominio funcional (reservas, mesas, salud) se encapsula en un
módulo independiente que agrupa su controlador, su servicio y sus objetos de
transferencia de datos (DTO). La lógica de negocio reside exclusivamente en la capa de
servicios, mientras que los controladores se limitan a recibir las peticiones HTTP y
delegar.

### Diagrama de arquitectura (ASCII)

```
                         ┌───────────────────────────┐
                         │      Cliente HTTP          │
                         │ (Swagger UI, curl, app web)│
                         └─────────────┬─────────────┘
                                       │  HTTP/JSON
                                       ▼
        ┌──────────────────────────────────────────────────────────┐
        │                    NestJS Application                      │
        │                                                            │
        │   ┌──────────────────── Capa transversal ──────────────┐  │
        │   │  ValidationPipe  │  LoggingInterceptor  │ Exception │  │
        │   │  (class-validator)│                      │  Filter   │  │
        │   └──────────────────────────────────────────────────────┘ │
        │                                                            │
        │   ┌─────────────┐   ┌─────────────┐   ┌────────────────┐   │
        │   │ Reservations│   │   Tables    │   │     Health     │   │
        │   │   Module    │   │   Module    │   │     Module     │   │
        │   ├─────────────┤   ├─────────────┤   ├────────────────┤   │
        │   │ Controller  │   │ Controller  │   │   Controller   │   │
        │   │     ▼       │   │     ▼       │   └────────────────┘   │
        │   │  Service ◄──┼───┼──► Service  │                        │
        │   │     ▼       │   │     ▼       │   (forwardRef entre    │
        │   │  DTOs /     │   │  DTOs /     │    Reservations y      │
        │   │  Entities   │   │  Entities   │    Tables)             │
        │   └──────┬──────┘   └──────┬──────┘                        │
        │          │                 │                               │
        │          ▼                 ▼                               │
        │   ┌────────────────────────────────────┐                  │
        │   │   Almacenamiento EN MEMORIA          │                  │
        │   │   (arreglos privados en servicios)   │                  │
        │   └────────────────────────────────────┘                  │
        └──────────────────────────────────────────────────────────┘
```

El flujo de una petición es: **Cliente → ValidationPipe → Controlador → Servicio
(reglas de negocio) → Almacenamiento en memoria → respuesta**, atravesando el
interceptor de logging y, en caso de error, el filtro global de excepciones que
normaliza la respuesta.

## 2. Tecnologías Utilizadas y Justificación

| Tecnología | Versión | Rol en el proyecto | Justificación técnica |
|------------|---------|--------------------|-----------------------|
| **NestJS** | 10.x | Framework principal del backend; organiza módulos, controladores y servicios. | Arquitectura modular y opinada que favorece la escalabilidad, la inyección de dependencias y la testabilidad. Integra de forma nativa validación, documentación y pruebas. |
| **TypeScript** | 5.6 | Lenguaje de desarrollo. | Tipado estático que reduce errores en tiempo de compilación, mejora el autocompletado y documenta los contratos de datos. |
| **Node.js** | 18 LTS+ | Entorno de ejecución del servidor. | Motor asíncrono basado en eventos, idóneo para APIs de alta concurrencia con uso intensivo de E/S. |
| **Jest** | 29.x | Framework de pruebas unitarias y de integración. | Estándar de facto en el ecosistema Node/Nest; rápido, con aserciones expresivas y medición de cobertura integrada. |
| **Supertest** | 7.x | Cliente HTTP para pruebas e2e. | Permite ejercitar la aplicación real mediante peticiones HTTP sin levantar un servidor externo. |
| **Swagger / OpenAPI** | 3.0 (`@nestjs/swagger` 7.x) | Documentación interactiva y contrato de la API. | Genera documentación viva a partir de decoradores; habilita el enfoque API First y la prueba directa desde el navegador. |
| **class-validator** | 0.14 | Validación declarativa de DTOs. | Aplica reglas de validación mediante decoradores, manteniendo los controladores limpios. |
| **class-transformer** | 0.5 | Transformación y conversión de tipos de los DTOs. | Convierte los datos entrantes a los tipos esperados (p. ej. cadenas numéricas a números). |
| **Git** | 2.x | Control de versiones local. | Registro histórico de cambios, ramas y reversión segura. |
| **GitHub** | — | Repositorio remoto y colaboración. | Alojamiento del código, gestión de incidencias (Issues) y base para integración continua. |

## 3. Principio API First

### 3.1 ¿Qué es API First?

**API First** es un enfoque de desarrollo en el que el **contrato de la API se define
antes de escribir la implementación**. El contrato (expresado en OpenAPI) se convierte
en la fuente de verdad que guía tanto al equipo de backend como a los consumidores de
la API, permitiendo que ambos trabajen en paralelo sobre una especificación acordada.

### 3.2 Cómo se aplicó en este proyecto

1. Se definió el contrato de la API en el archivo [`swagger.yaml`](../swagger.yaml)
   (OpenAPI 3.0), describiendo todos los endpoints, esquemas de datos, parámetros y
   códigos de respuesta antes de implementar la lógica.
2. La implementación se construyó **reflejando ese contrato** mediante los decoradores
   de `@nestjs/swagger` (`@ApiTags`, `@ApiOperation`, `@ApiProperty`, `@ApiOkResponse`,
   etc.) en controladores y DTOs.
3. NestJS genera en tiempo de ejecución una especificación equivalente, accesible en
   `GET /api/docs-json` y renderizada como Swagger UI en `GET /api/docs`.

### 3.3 Beneficios obtenidos

- **Documentación siempre sincronizada** con el código, al derivarse de los mismos
  decoradores que definen los DTOs.
- **Validación temprana del diseño**: los esquemas y códigos de respuesta se acordaron
  antes de programar, reduciendo retrabajo.
- **Pruebas manuales inmediatas** desde Swagger UI, sin herramientas externas.
- **Onboarding rápido** de nuevos integrantes, que comprenden la API leyendo el
  contrato.

## 4. Estructura del Proyecto

```
restaurante-reservas/
├── src/
│   ├── main.ts                     # Punto de entrada: CORS, ValidationPipe, Swagger
│   ├── app.module.ts               # Módulo raíz que ensambla los módulos de dominio
│   ├── common/                     # Código transversal reutilizable
│   │   ├── constants/              # Franjas horarias válidas y reglas de fecha
│   │   ├── exceptions/             # BusinessException (errores de dominio)
│   │   ├── filters/                # AllExceptionsFilter (respuesta de error uniforme)
│   │   └── interceptors/           # LoggingInterceptor (trazabilidad de peticiones)
│   └── modules/
│       ├── reservations/           # Dominio de reservas
│       │   ├── dto/                # DTOs de entrada/salida con validación
│       │   ├── entities/           # Entidad Reservation y enum de estados
│       │   ├── reservations.controller.ts
│       │   ├── reservations.service.ts   # Reglas de negocio
│       │   ├── reservations.module.ts
│       │   ├── reservations.service.spec.ts
│       │   └── reservations.controller.spec.ts
│       ├── tables/                 # Dominio de mesas y disponibilidad
│       │   ├── dto/ entities/ tables.controller.ts tables.service.ts tables.module.ts
│       └── health/                 # Health check del sistema
│           ├── dto/ health.controller.ts health.module.ts
├── test/
│   ├── app.e2e-spec.ts             # Pruebas extremo a extremo
│   └── jest-e2e.json               # Configuración de Jest para e2e
├── swagger.yaml                    # Contrato OpenAPI (artefacto API First)
├── docs/                           # Documentación académica del proyecto
├── .env.example                    # Plantilla de variables de entorno
├── package.json
├── tsconfig.json
└── README.md
```

### Patrones de diseño empleados

- **Módulos (Module):** cada dominio se aísla en su propio módulo, con sus
  dependencias declaradas explícitamente. Favorece el bajo acoplamiento.
- **Controladores (Controller):** capa delgada que mapea rutas HTTP a métodos de
  servicio. No contiene lógica de negocio.
- **Servicios (Service / Provider):** concentran las reglas de negocio y el acceso al
  almacenamiento. Se inyectan mediante el contenedor de dependencias de NestJS.
- **DTO (Data Transfer Object):** definen y validan la forma de los datos de entrada
  (`CreateReservationDto`, `UpdateReservationDto`, `QueryReservationDto`) y de salida
  (`ReservationResponseDto`). `UpdateReservationDto` reutiliza `CreateReservationDto`
  mediante `PartialType`, evitando duplicación.
- **Filtro de excepciones (Exception Filter):** centraliza el formato de todas las
  respuestas de error.
- **Interceptor:** añade comportamiento transversal (logging) sin contaminar la lógica.
- **Inyección de dependencias con `forwardRef`:** resuelve la dependencia circular
  legítima entre el servicio de reservas y el de mesas.

## 5. Decisiones de Diseño

### 5.1 ¿Por qué almacenamiento en memoria?

El proyecto tiene un **alcance académico** centrado en demostrar el ciclo de vida del
software (diseño, implementación, pruebas y documentación). Un almacenamiento en
memoria mediante arreglos privados en los servicios elimina la complejidad de
configurar y desplegar una base de datos, permite ejecutar el sistema con un único
comando y simplifica las pruebas, sin perder la capacidad de demostrar las reglas de
negocio. La capa de servicio está diseñada de forma que sustituir el arreglo por un
repositorio real (TypeORM, Prisma) sería un cambio localizado.

### 5.2 ¿Por qué NestJS sobre Express puro?

Aunque Express es un framework minimalista válido, NestJS aporta de serie una
**estructura modular**, **inyección de dependencias**, **validación declarativa**,
**generación de documentación** y un **modelo de pruebas integrado**. Estas
características reducen el código repetitivo, imponen buenas prácticas arquitectónicas y
facilitan la mantenibilidad, lo que resulta especialmente valioso en un contexto
formativo donde se evalúa la calidad estructural del software.

### 5.3 Manejo de errores centralizado

El sistema implementa un **filtro global de excepciones** (`AllExceptionsFilter`) que
unifica todas las respuestas de error en una estructura consistente:

```json
{
  "statusCode": 409,
  "message": "La mesa A1 ya está reservada el 2026-06-20 a las 19:30",
  "error": "BusinessException",
  "errorCode": "DOUBLE_BOOKING",
  "timestamp": "2026-06-06T15:00:00.000Z",
  "path": "/reservations"
}
```

Se distinguen los siguientes códigos de estado con una semántica HTTP deliberada:

- **400 Bad Request:** abarca tanto los errores de **formato/validación** detectados
  por `class-validator` (campos obligatorios, tipos, rangos) como las **violaciones de
  reglas de negocio** representadas por la excepción de dominio `BusinessException`.
  Estas últimas incluyen un `errorCode` legible (`INVALID_TIME_SLOT`, `DATE_IN_PAST`,
  `DATE_OUT_OF_RANGE`, `INVALID_STATUS_TRANSITION`, `TABLE_CAPACITY_EXCEEDED`,
  `NO_TABLE_AVAILABLE`).
- **409 Conflict:** reservado para el conflicto de recurso por excelencia, la **doble
  reserva** (`errorCode:"DOUBLE_BOOKING"`), cuando se intenta ocupar una mesa que ya
  tiene una reserva activa en la misma fecha y franja.
- **404 Not Found:** cuando se solicita una reserva o recurso inexistente.

La presencia del campo `errorCode` permite a los clientes distinguir
programáticamente un problema de entrada de una condición del negocio.

## 6. Guía de Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/<organizacion>/restaurante-reservas.git
cd restaurante-reservas

# 2. Instalar dependencias
npm install

# 3. (Opcional) crear el archivo de entorno a partir de la plantilla
cp .env.example .env

# 4. Ejecutar en modo desarrollo (recarga en caliente)
npm run start:dev

# 5. Acceder a la documentación interactiva
#    http://localhost:3000/api/docs

# --- Otros comandos útiles ---
npm run build         # Compilar a JavaScript (carpeta dist/)
npm run start:prod    # Ejecutar la versión compilada
npm test              # Pruebas unitarias y de controlador
npm run test:cov      # Pruebas con reporte de cobertura
npm run test:e2e      # Pruebas extremo a extremo
```

## 7. Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto en el que escucha la aplicación. | `3000` |
| `CORS_ORIGIN` | Orígenes permitidos para CORS (separados por coma; `*` permite todos). | `*` |
| `API_PREFIX` | Prefijo global opcional para todas las rutas. | _(vacío)_ |
| `NODE_ENV` | Entorno de ejecución (`development`, `production`). | `development` |
