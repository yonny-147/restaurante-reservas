import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor de logging.
 *
 * Registra el método, la ruta y el tiempo de respuesta de cada petición.
 * Útil para trazabilidad y para la demostración del ciclo de vida del
 * software (observabilidad básica).
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const start = Date.now();

    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(`${method} ${url} - ${Date.now() - start}ms`),
        ),
      );
  }
}
