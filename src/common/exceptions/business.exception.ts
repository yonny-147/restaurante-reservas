import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Excepción de dominio para errores de reglas de negocio.
 *
 * Se usa en la capa de servicio cuando una operación es sintácticamente
 * válida pero viola una regla del negocio (p. ej. fuera de rango de fechas,
 * franja horaria inválida). Por defecto responde con 400 Bad Request; los
 * conflictos de recurso (p. ej. doble reserva) pasan 409 Conflict de forma
 * explícita. Incluye un `errorCode` legible para clientes.
 */
export class BusinessException extends HttpException {
  /** Código de error estable y legible para el cliente (p. ej. DOUBLE_BOOKING). */
  public readonly errorCode: string;

  constructor(
    message: string,
    errorCode = 'BUSINESS_RULE_VIOLATION',
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message, status);
    this.errorCode = errorCode;
  }
}
