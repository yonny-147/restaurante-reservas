# Manual de Usuario - Sistema de Reservas

> **Proyecto:** Sistema de Reservas de Restaurante (API REST)
> **Versión:** 1.0.0
> **Año:** 2026

---

## 1. Introducción al Sistema

El *Sistema de Reservas de Restaurante* es una interfaz de programación de
aplicaciones (API REST) que permite gestionar de forma centralizada las reservas de
mesas de un restaurante. A través de él, una aplicación cliente (sitio web, aplicación
móvil o panel administrativo) puede crear reservas, consultarlas, modificarlas,
cancelarlas y verificar la disponibilidad de mesas en una fecha y franja horaria
determinadas.

El sistema aplica automáticamente las reglas del negocio del restaurante:

- Atiende en dos turnos: **almuerzo (12:00–15:00)** y **cena (19:00–23:00)**, con
  franjas cada **30 minutos**.
- Solo permite reservar **desde el día actual y hasta 30 días en el futuro**.
- Impide que una misma mesa se reserve dos veces en la misma fecha y franja.
- Gestiona el ciclo de vida de cada reserva mediante estados controlados.

## 2. Requisitos para Usar el Sistema

Para ejecutar y consumir el sistema en un entorno local se requiere:

| Requisito | Versión recomendada |
|-----------|---------------------|
| Node.js | 18 LTS o superior |
| npm | 9 o superior |
| Cliente HTTP | `curl`, Postman, Insomnia o el navegador (para Swagger UI) |
| Sistema operativo | Windows, macOS o Linux |

El servicio se ejecuta por defecto en el puerto **3000**. No se requiere instalar
ninguna base de datos, ya que la información se mantiene en memoria mientras el
servicio esté activo.

## 3. Acceso a la Documentación Interactiva (Swagger UI)

El sistema expone una documentación interactiva basada en **Swagger UI / OpenAPI 3.0**
que permite explorar y probar todos los endpoints directamente desde el navegador, sin
necesidad de herramientas externas.

- **URL:** http://localhost:3000/api/docs
- **Contrato OpenAPI en formato JSON:** http://localhost:3000/api/docs-json

> **Descripción de la pantalla (referencia visual):** al abrir la URL anterior, el
> usuario visualiza una página con el título *"API de Reservas de Restaurante"* y la
> versión *1.0.0*. Debajo aparecen tres secciones plegables agrupadas por etiqueta:
> **reservations**, **tables** y **health**. Cada endpoint se muestra con su método
> HTTP coloreado (verde para `GET`, azul para `POST`, naranja para `PATCH`, rojo para
> `DELETE`). Al hacer clic en un endpoint se despliega su descripción, los parámetros,
> el cuerpo de ejemplo y un botón **"Try it out"** que permite enviar peticiones
> reales y observar la respuesta del servidor.

## 4. Guía de Endpoints

### 4.1 `POST /reservations` — Crear una reserva

**Descripción:** registra una nueva reserva. Si no se especifica `tableId`, el sistema
asigna automáticamente la mesa libre de menor capacidad que admita el número de
comensales.

**Ejemplo de request:**

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

**Respuesta exitosa (201 Created):**

```json
{
  "id": "5740f917-942b-4a69-af05-e026756f8ae9",
  "customerName": "Juan Pérez",
  "customerEmail": "juan.perez@example.com",
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

**Errores comunes:**

| Código | Causa | Cómo solucionarlo |
|--------|-------|-------------------|
| `400` | Email mal formado, teléfono inválido, `partySize` fuera de 1–20. | Verificar el formato de los campos. |
| `400` | Franja horaria fuera de turno, fecha pasada o a más de 30 días. | Usar una franja válida y una fecha dentro del rango permitido. |
| `409` | La mesa solicitada ya está reservada (`DOUBLE_BOOKING`). | Elegir otra mesa u otra franja, o consultar disponibilidad. |

### 4.2 `GET /reservations` — Listar reservas

**Descripción:** devuelve todas las reservas. Admite filtros opcionales por `date` y
por `status`.

**Ejemplo de request:**

```bash
curl "http://localhost:3000/reservations?status=PENDING"
```

**Respuesta exitosa (200 OK):**

```json
[
  {
    "id": "5740f917-942b-4a69-af05-e026756f8ae9",
    "customerName": "Juan Pérez",
    "date": "2026-06-20",
    "time": "19:30",
    "partySize": 4,
    "tableId": 3,
    "status": "PENDING",
    "createdAt": "2026-06-06T21:13:41.856Z",
    "updatedAt": "2026-06-06T21:13:41.856Z"
  }
]
```

**Errores comunes:** el formato de `date` debe ser `YYYY-MM-DD` y `status` debe ser uno
de los valores válidos; de lo contrario se devuelve `400`.

### 4.3 `GET /reservations/{id}` — Obtener una reserva

**Descripción:** recupera el detalle de una reserva por su identificador único.

**Ejemplo de request:**

```bash
curl http://localhost:3000/reservations/5740f917-942b-4a69-af05-e026756f8ae9
```

**Respuesta exitosa (200 OK):** objeto de la reserva completo.

**Errores comunes:**

| Código | Causa |
|--------|-------|
| `404` | No existe una reserva con el identificador indicado. |

### 4.4 `PATCH /reservations/{id}` — Actualizar una reserva

**Descripción:** permite reprogramar (cambiar fecha, hora o número de comensales) o
avanzar el estado de la reserva. Solo se permiten transiciones de estado válidas.

**Ejemplo de request (confirmar):**

```bash
curl -X PATCH http://localhost:3000/reservations/5740f917-942b-4a69-af05-e026756f8ae9 \
  -H "Content-Type: application/json" \
  -d '{ "status": "CONFIRMED" }'
```

**Respuesta exitosa (200 OK):**

```json
{
  "id": "5740f917-942b-4a69-af05-e026756f8ae9",
  "status": "CONFIRMED",
  "updatedAt": "2026-06-06T21:20:00.000Z"
}
```

**Errores comunes:**

| Código | Causa |
|--------|-------|
| `404` | La reserva no existe. |
| `400` | Transición de estado inválida (p. ej. `PENDING → COMPLETED`) o la nueva mesa supera la capacidad. |
| `409` | La nueva fecha/franja/mesa genera una doble reserva. |

### 4.5 `DELETE /reservations/{id}` — Cancelar una reserva

**Descripción:** cancela una reserva. La mesa queda nuevamente disponible para otros
clientes.

**Ejemplo de request:**

```bash
curl -X DELETE http://localhost:3000/reservations/5740f917-942b-4a69-af05-e026756f8ae9
```

**Respuesta exitosa (200 OK):**

```json
{
  "id": "5740f917-942b-4a69-af05-e026756f8ae9",
  "status": "CANCELLED",
  "updatedAt": "2026-06-06T21:25:00.000Z"
}
```

**Errores comunes:**

| Código | Causa |
|--------|-------|
| `404` | La reserva no existe. |
| `400` | La reserva ya estaba cancelada o ya fue completada. |

### 4.6 `GET /tables` — Listar mesas

**Descripción:** devuelve el catálogo completo de mesas del restaurante.

**Ejemplo de request:**

```bash
curl http://localhost:3000/tables
```

**Respuesta exitosa (200 OK):**

```json
[
  { "id": 1, "label": "A1", "capacity": 2, "location": "INDOOR" },
  { "id": 3, "label": "B1", "capacity": 4, "location": "INDOOR" },
  { "id": 8, "label": "P2", "capacity": 20, "location": "PRIVATE" }
]
```

### 4.7 `GET /tables/available` — Consultar disponibilidad

**Descripción:** devuelve las mesas libres en una fecha y franja horaria concretas.

**Ejemplo de request:**

```bash
curl "http://localhost:3000/tables/available?date=2026-06-20&time=19:30"
```

**Respuesta exitosa (200 OK):** arreglo con las mesas que no tienen reserva activa en
esa fecha y franja.

**Errores comunes:**

| Código | Causa |
|--------|-------|
| `400` | La franja indicada no es válida (`INVALID_TIME_SLOT`). |
| `400` | `date` o `time` con formato incorrecto. |

### 4.8 `GET /health` — Estado del sistema

**Descripción:** verifica que el servicio está operativo. Útil para monitoreo.

**Ejemplo de request:**

```bash
curl http://localhost:3000/health
```

**Respuesta exitosa (200 OK):**

```json
{ "status": "ok", "uptime": 1234, "timestamp": "2026-06-06T21:13:41.813Z" }
```

## 5. Flujo Completo de una Reserva

A continuación se describe el ciclo de vida completo de una reserva, paso a paso:

1. **Crear la reserva** (`POST /reservations`). La reserva nace en estado **`PENDING`**
   (pendiente de confirmación).

   ```bash
   curl -X POST http://localhost:3000/reservations -H "Content-Type: application/json" \
     -d '{"customerName":"Carlos Ruiz","customerEmail":"carlos@example.com",
          "customerPhone":"+57 3012223344","date":"2026-06-20","time":"20:00",
          "partySize":4,"tableId":3}'
   ```

2. **Confirmar la reserva** (`PATCH`, `status: "CONFIRMED"`). El restaurante valida la
   reserva. Pasa de **`PENDING` → `CONFIRMED`**.

   ```bash
   curl -X PATCH http://localhost:3000/reservations/{id} \
     -H "Content-Type: application/json" -d '{"status":"CONFIRMED"}'
   ```

3. **Sentar al cliente** (`PATCH`, `status: "SEATED"`). Cuando el cliente llega y ocupa
   la mesa. Pasa de **`CONFIRMED` → `SEATED`**.

   ```bash
   curl -X PATCH http://localhost:3000/reservations/{id} \
     -H "Content-Type: application/json" -d '{"status":"SEATED"}'
   ```

4. **Completar la reserva** (`PATCH`, `status: "COMPLETED"`). Al finalizar el servicio.
   Pasa de **`SEATED` → `COMPLETED`** (estado final).

   ```bash
   curl -X PATCH http://localhost:3000/reservations/{id} \
     -H "Content-Type: application/json" -d '{"status":"COMPLETED"}'
   ```

> En cualquier momento previo a `COMPLETED`, la reserva puede pasar a **`CANCELLED`**
> mediante `DELETE /reservations/{id}`.

**Diagrama del flujo de estados:**

```
   ┌─────────┐   confirmar   ┌───────────┐   sentar   ┌────────┐   completar   ┌───────────┐
   │ PENDING │ ────────────► │ CONFIRMED │ ─────────► │ SEATED │ ────────────► │ COMPLETED │
   └────┬────┘               └─────┬─────┘            └───┬────┘               └───────────┘
        │                          │                      │
        │ cancelar                 │ cancelar             │ cancelar
        ▼                          ▼                      ▼
                            ┌─────────────┐
                            │  CANCELLED  │
                            └─────────────┘
```

## 6. Preguntas Frecuentes

**¿Puedo reservar para hoy mismo?**
Sí. El sistema permite reservas desde el día actual y hasta 30 días en el futuro.

**¿Qué pasa si no indico una mesa?**
El sistema asigna automáticamente la mesa libre más pequeña que admita el tamaño de tu
grupo, optimizando el uso del espacio.

**¿Por qué me rechaza el horario 16:00?**
El restaurante solo atiende entre 12:00–15:00 y 19:00–23:00, en franjas de 30 minutos.
Las horas fuera de esos turnos no son válidas.

**¿Se conservan las reservas si reinicio el servidor?**
No. El sistema utiliza almacenamiento en memoria por su carácter académico; al
reiniciar el servicio, los datos se reinician.

**¿Cuál es la diferencia entre el error 400 y el 409?**
Un `400` indica un problema con la solicitud: un dato mal formado (un email incorrecto)
o una **regla de negocio incumplida** (un horario fuera de turno o una fecha pasada).
Un `409` (*Conflict*) es específico de la **doble reserva**: indica que la mesa que
intentas reservar ya está ocupada en esa fecha y franja.

**¿Puedo cancelar una reserva ya completada?**
No. Una reserva en estado `COMPLETED` es final y no puede cancelarse ni modificarse.

## 7. Glosario

| Término | Definición |
|---------|------------|
| **API REST** | Interfaz que permite la comunicación entre aplicaciones mediante peticiones HTTP. |
| **Endpoint** | Dirección (URL + método HTTP) que expone una operación de la API. |
| **DTO** | *Data Transfer Object*; objeto que define y valida la estructura de los datos que entran o salen de la API. |
| **Franja horaria (slot)** | Intervalo de 30 minutos dentro de los turnos de atención en el que se puede reservar. |
| **PENDING / CONFIRMED / SEATED / COMPLETED / CANCELLED** | Estados del ciclo de vida de una reserva. |
| **partySize** | Número de comensales de la reserva (entre 1 y 20). |
| **Swagger UI / OpenAPI** | Estándar y herramienta para documentar y probar APIs de forma interactiva. |
| **errorCode** | Código legible incluido en las respuestas de error de negocio (p. ej. `DOUBLE_BOOKING`). |
| **uptime** | Tiempo, en segundos, que el servicio lleva en ejecución. |
