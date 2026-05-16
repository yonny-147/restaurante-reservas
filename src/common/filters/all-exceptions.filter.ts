import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from '../exceptions/business.exception';

// Updated: returns consistent { statusCode, message,
// error, errorCode, timestamp, path } structure
/**
 * Forma estándar de toda respuesta de error de la API.
 */
export interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error: string;
  errorCode?: string;
  timestamp: string;
  path: string;
}

/**
 * Filtro global de excepciones.
 *
 * Captura cualquier error lanzado en la aplicación y lo normaliza a una
 * estructura consistente: { statusCode, message, error, timestamp }.
 * Distingue entre HttpException (incl. errores de validación y
 * BusinessException) y errores no controlados (500).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';
    let errorCode: string | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, unknown>;
        // class-validator y Nest exponen `message` y `error`
        message = (body.message as string | string[]) ?? exception.message;
        error = (body.error as string) ?? error;
      }

      if (exception instanceof BusinessException) {
        errorCode = exception.errorCode;
      }
      // Nombre del status HTTP por defecto cuando no viene `error`
      error = error === 'Internal Server Error' ? exception.name : error;
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.message, exception.stack);
    }

    const body: ErrorResponseBody = {
      statusCode,
      message,
      error,
      ...(errorCode ? { errorCode } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(body);
  }
}
