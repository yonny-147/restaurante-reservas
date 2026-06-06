# Gestión Post-Proyecto - Estrategia de Soporte y Mantenimiento

> **Proyecto:** Sistema de Reservas de Restaurante (API REST)
> **Curso:** Ingeniería de Software
> **Año:** 2026

---

## 1. Resumen del Proyecto Entregado

El *Sistema de Reservas de Restaurante* es una API REST desarrollada con NestJS y
TypeScript que permite gestionar el ciclo completo de las reservas de un restaurante:
creación, consulta, modificación, cancelación y verificación de disponibilidad de
mesas. El sistema aplica de forma automática las reglas de negocio (turnos de atención,
ventana de reserva de 30 días, prevención de doble reserva y flujo de estados) y expone
una documentación interactiva basada en OpenAPI 3.0.

**Indicadores de la entrega:**

| Indicador | Valor |
|-----------|-------|
| Endpoints implementados | 8 |
| Módulos funcionales | 3 (Reservas, Mesas, Salud) |
| Pruebas automatizadas | 33 (25 unitarias/controlador + 8 e2e), 100 % aprobadas |
| Cobertura de la capa de dominio | 94.05 % de sentencias |
| Documentación entregada | 4 documentos técnicos + README + contrato OpenAPI |
| Versión entregada | 1.0.0 |

El presente documento define la estrategia para sostener y evolucionar el sistema una
vez finalizada la entrega del Sprint 4.

## 2. Estrategia de Soporte Post-Entrega

### 2.1 Canales de reporte de incidencias

El canal oficial para el reporte de defectos, dudas y solicitudes de mejora es
**GitHub Issues** del repositorio del proyecto. Cada incidencia debe registrarse con:

- Título descriptivo.
- Pasos para reproducir el problema.
- Resultado esperado y resultado obtenido.
- Etiqueta de severidad (ver tabla 2.2) y tipo (`bug`, `enhancement`, `question`).
- Evidencias (respuesta JSON, captura, código de estado).

Como canales complementarios se definen el tablero de **GitHub Projects** para el
seguimiento del estado de cada incidencia y un correo de contacto del equipo para
comunicaciones formales.

### 2.2 Niveles de severidad y SLA simulado

| Severidad | Descripción | Tiempo de primera respuesta (SLA) | Tiempo objetivo de resolución |
|-----------|-------------|-----------------------------------|-------------------------------|
| **Crítico** | El sistema está caído o una funcionalidad central (crear/consultar reservas) es inutilizable. | 2 horas | 8 horas |
| **Alto** | Funcionalidad importante degradada sin alternativa razonable (p. ej. el filtro de disponibilidad arroja datos incorrectos). | 4 horas | 24 horas |
| **Medio** | Defecto con solución alternativa disponible o de impacto moderado. | 1 día hábil | 5 días hábiles |
| **Bajo** | Problema cosmético, de documentación o mejora menor. | 3 días hábiles | Próxima versión planificada |

## 3. Plan de Mantenimiento

| Tipo | Frecuencia | Responsable | Descripción |
|------|-----------|-------------|-------------|
| **Correctivo** | Bajo demanda (según incidencias) | Desarrollador de turno | Corrección de defectos reportados, priorizados por severidad y SLA. |
| **Preventivo** | Mensual | Equipo de desarrollo | Actualización de dependencias, ejecución de `npm audit`, revisión de logs y de la cobertura de pruebas para evitar regresiones. |
| **Evolutivo** | Por sprint (cada 2–3 semanas) | Equipo de desarrollo + Product Owner | Incorporación de nuevas funcionalidades (p. ej. notificaciones por correo, autenticación, reportes). |
| **Adaptativo** | Trimestral o según necesidad | Equipo de desarrollo | Adaptación a cambios del entorno: nuevas versiones de Node.js/NestJS, migración a base de datos persistente, despliegue en la nube. |

## 4. Gestión de Versiones

### 4.1 Estrategia de versionado: SemVer

El proyecto adopta **Versionado Semántico (SemVer)** con el formato
`MAJOR.MINOR.PATCH`:

- **MAJOR:** cambios incompatibles en el contrato de la API (p. ej. eliminar o renombrar
  un endpoint o un campo obligatorio).
- **MINOR:** nuevas funcionalidades retrocompatibles (p. ej. un nuevo endpoint o un
  filtro adicional).
- **PATCH:** correcciones de errores retrocompatibles, sin cambios en el contrato.

La versión actual entregada es la **1.0.0**.

### 4.2 Estrategia de ramas

| Rama | Propósito |
|------|-----------|
| `main` | Código estable y desplegable a **producción**. Cada fusión corresponde a una versión etiquetada. |
| `develop` | Rama de **integración de desarrollo**, donde confluyen las funcionalidades en curso. |
| `feature/*` | Ramas efímeras por funcionalidad, creadas desde `develop`. |
| `hotfix/*` | Correcciones urgentes creadas desde `main` para defectos críticos en producción. |

### 4.3 Proceso de release

1. Las funcionalidades se integran en `develop` mediante *Pull Requests* revisados.
2. Se ejecuta la batería completa de pruebas (`npm test` y `npm run test:e2e`); todas
   deben aprobar.
3. Se actualiza el número de versión en `package.json` y se documentan los cambios en
   un archivo `CHANGELOG.md`.
4. Se fusiona `develop` en `main` y se crea una **etiqueta Git** (`git tag v1.1.0`).
5. Se publica la *Release* en GitHub con sus notas de versión.

## 5. Métricas de Calidad Post-Entrega

### 5.1 KPIs definidos

| KPI | Definición | Objetivo |
|-----|------------|----------|
| **Disponibilidad (uptime)** | Porcentaje de tiempo en que el servicio responde correctamente al endpoint `/health`. | ≥ 99.5 % mensual |
| **Tiempo de respuesta** | Latencia promedio de las peticiones. | < 100 ms (p95) |
| **Tasa de errores** | Proporción de respuestas `5xx` sobre el total de peticiones. | < 1 % |
| **Cobertura de pruebas** | Porcentaje de código cubierto por pruebas automatizadas. | ≥ 90 % en la capa de dominio |
| **Tiempo medio de resolución (MTTR)** | Tiempo promedio para resolver una incidencia crítica. | < 8 horas |

> El endpoint `GET /health` ya expone `status` y `uptime`, sirviendo como sonda básica
> para el cálculo de la disponibilidad.

### 5.2 Herramientas de monitoreo recomendadas

- **Prometheus + Grafana:** recolección de métricas y tableros de visualización.
- **UptimeRobot / Better Stack:** monitoreo externo del endpoint `/health` y alertas.
- **Sentry:** captura y agregación de errores en tiempo de ejecución.
- **GitHub Actions:** integración continua que ejecuta pruebas y mide cobertura en cada
  *Pull Request*.

## 6. Riesgos Identificados y Mitigación

| Riesgo | Probabilidad | Impacto | Estrategia de mitigación |
|--------|-------------|---------|--------------------------|
| Pérdida de datos por almacenamiento en memoria al reiniciar el servicio. | Alta | Alto | Migrar a una base de datos persistente (PostgreSQL con TypeORM/Prisma) en una versión evolutiva. |
| Vulnerabilidades en dependencias de terceros. | Media | Alto | Ejecutar `npm audit` en el mantenimiento preventivo mensual y automatizar Dependabot en GitHub. |
| Ausencia de autenticación y autorización. | Media | Alto | Incorporar autenticación (JWT) y control de roles en una versión MINOR antes de un despliegue real. |
| Degradación de rendimiento ante alta concurrencia. | Baja | Medio | Pruebas de carga periódicas (k6/Artillery) y escalado horizontal del servicio. |
| Pérdida de conocimiento por rotación del equipo. | Media | Medio | Mantener documentación actualizada (`docs/`) y comentarios en el código; aplicar revisiones por pares. |
| Desalineación entre el contrato OpenAPI y la implementación. | Baja | Medio | Pruebas de contrato automatizadas que validen las respuestas contra `swagger.yaml`. |

## 7. Lecciones Aprendidas

### 7.1 Qué funcionó bien

- El enfoque **API First** permitió acordar el contrato antes de programar, reduciendo
  el retrabajo y facilitando la documentación interactiva desde el primer día.
- La **arquitectura modular de NestJS** mantuvo el código organizado y testeable; la
  separación entre controladores y servicios facilitó alcanzar una cobertura superior
  al 94 % en la capa de dominio.
- El **manejo centralizado de errores** con `BusinessException` y un filtro global
  produjo respuestas consistentes y fáciles de consumir por los clientes.
- La automatización de **33 pruebas** dio confianza para refactorizar sin introducir
  regresiones.

### 7.2 Qué mejorar en futuros proyectos

- Incorporar **integración continua** desde el inicio para ejecutar las pruebas en cada
  cambio.
- Añadir **pruebas de contrato** que validen automáticamente la implementación frente
  al archivo OpenAPI.
- Planificar desde el comienzo la **capa de persistencia**, aun cuando el primer
  entregable use almacenamiento en memoria, para minimizar el costo de migración.

### 7.3 Recomendaciones para el equipo

1. Mantener la documentación de `docs/` sincronizada con cada cambio funcional.
2. Adoptar revisiones de código obligatorias por *Pull Request*.
3. Respetar el versionado SemVer y registrar los cambios en un `CHANGELOG.md`.
4. Definir un *Definition of Done* que incluya pruebas, documentación y cobertura
   mínima antes de dar por cerrada una tarea.