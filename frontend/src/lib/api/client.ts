import axios, { AxiosError } from 'axios';
import type { ApiErrorBody } from '@/lib/types';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

/**
 * Extrae un mensaje legible para el usuario a partir del error de Axios,
 * usando la estructura de error del backend: { statusCode, message, errorCode }.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;

    if (axiosError.response?.data) {
      const { message } = axiosError.response.data;
      if (Array.isArray(message)) return message.join('. ');
      if (typeof message === 'string') return message;
    }

    if (axiosError.code === 'ECONNABORTED') {
      return 'La solicitud tardó demasiado. Inténtalo de nuevo.';
    }
    if (axiosError.code === 'ERR_NETWORK') {
      return 'No se pudo conectar con el servidor. Verifica que la API esté activa.';
    }
  }

  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado.';
}
