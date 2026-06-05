# 🍽️ Sistema de Reservas - Restaurante

![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?logo=swagger&logoColor=black)
![Jest](https://img.shields.io/badge/Jest-29-C21325?logo=jest&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## Descripción

API REST para la gestión de reservas de un restaurante, construida con **NestJS** y
**TypeScript** bajo un enfoque **API First**. Permite crear, consultar, modificar y
cancelar reservas, así como verificar la disponibilidad de mesas, aplicando
automáticamente las reglas de negocio del restaurante. El proyecto es un entregable
académico del curso de Ingeniería de Software (año 2026) y prioriza la limpieza del
código, la testabilidad y la documentación.

## Características principales

- ✅ Gestión completa del ciclo de vida de una reserva (`PENDING → CONFIRMED → SEATED → COMPLETED`, con cancelación).
- ✅ Prevención de **doble reserva** sobre la misma mesa, fecha y franja horaria.
- ✅ Validación de **turnos de atención** (12:00–15:00 y 19:00–23:00, cada 30 min) y de la **ventana de reserva** (hoy hasta 30 días).
- ✅ **Asignación automática** de la mejor mesa libre cuando no se indica una.
- ✅ Consulta de **disponibilidad** de mesas por fecha y franja.
- ✅ **Validación declarativa** de datos con class-validator y respuestas de error **consistentes**.
- ✅ **Documentación interactiva** Swagger UI en `/api/docs`.
- ✅ **33 pruebas automatizadas** (unitarias, de controlador y e2e) con cobertura > 94 % en la capa de dominio.

## Stack tecnológico

| Tecnología | Rol |
|------------|-----|
| **NestJS 10** | Framework backend modular |
| **TypeScript 5.6** | Lenguaje con tipado estático |
| **Swagger / OpenAPI 3.0** | Documentación y contrato de la API |
| **class-validator / class-transformer** | Validación y transformación de DTOs |
| **Jest 29 + Supertest 7** | Pruebas unitarias, de controlador y e2e |
| **Git / GitHub** | Control de versiones y colaboración |

## Instalación rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/<organizacion>/restaurante-reservas.git
cd restaurante-reservas

# 2. Instalar dependencias
npm install

# 3. (Opcional) crear el archivo de entorno
cp .env.example .env

# 4. Ejecutar en modo desarrollo
npm run start:dev
```

La API queda disponible en **http://localhost:3000** y la documentación interactiva en
**http://localhost:3000/api/docs**.

## Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/reservations` | Crear una nueva reserva |
| `GET` | `/reservations` | Listar reservas (filtros: `date`, `status`) |
| `GET` | `/reservations/:id` | Obtener una reserva por su identificador |
| `PATCH` | `/reservations/:id` | Actualizar (reprogramar o cambiar estado) |
| `DELETE` | `/reservations/:id` | Cancelar una reserva |
| `GET` | `/tables` | Listar todas las mesas |
| `GET` | `/tables/available` | Consultar mesas disponibles por `date` y `time` |
| `GET` | `/health` | Verificar el estado del sistema |

**Ejemplo — crear una reserva:**

```bash
curl -X POST http://localhost:3000/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Juan Pérez",
    "customerEmail": "juan.perez@example.com",
    "customerPhone": "+57 3001234567",
    "date": "2026-06-20",
    "time": "19:30",
    "partySize": 4
  }'
```

## Documentación

La documentación completa del proyecto se encuentra en la carpeta [`docs/`](./docs):

- 📋 [Plan de Pruebas](./docs/plan-de-pruebas.md) — estrategia, casos de prueba y evidencias.
- 📖 [Manual de Usuario](./docs/manual-usuario.md) — guía de uso de cada endpoint y flujos.
- 🏗️ [Documentación Técnica / Stack](./docs/tech-stack.md) — arquitectura, tecnologías y decisiones de diseño.
- 🔧 [Gestión Post-Proyecto](./docs/gestion-post-proyecto.md) — soporte, mantenimiento y versionado.
- 📑 [Contrato OpenAPI](./swagger.yaml) — especificación API First.

## Pruebas

```bash
npm test            # Pruebas unitarias y de controlador
npm run test:cov    # Pruebas con reporte de cobertura
npm run test:e2e    # Pruebas extremo a extremo
```

Resultado actual: **33 pruebas aprobadas (100 %)**; cobertura del **94.05 %** de
sentencias en el servicio de dominio.

## Estructura del proyecto

```
restaurante-reservas/
├── src/
│   ├── main.ts                  # Bootstrap: CORS, ValidationPipe, Swagger
│   ├── app.module.ts            # Módulo raíz
│   ├── common/                  # Excepciones, filtros, interceptores, constantes
│   └── modules/
│       ├── reservations/        # Dominio de reservas (controller, service, dto, entities)
│       ├── tables/              # Dominio de mesas y disponibilidad
│       └── health/              # Health check
├── test/
│   └── app.e2e-spec.ts          # Pruebas e2e
├── docs/                        # Documentación académica
├── swagger.yaml                 # Contrato OpenAPI (API First)
├── .env.example                 # Plantilla de variables de entorno
└── README.md
```

## Equipo

| Rol | Integrante |
|-----|------------|
| Desarrollo backend y documentación | Yonny Alexander Ospina Ospina |

> Proyecto académico — curso de Ingeniería de Software, 2026.

## Licencia

Distribuido bajo licencia **MIT**. Consulte el archivo `LICENSE` para más detalles.
