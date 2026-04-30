/**
 * Definición de franjas horarias válidas para reservar.
 *
 * El restaurante atiende en dos turnos, con franjas cada 30 minutos:
 *   - Almuerzo: 12:00 a 15:00
 *   - Cena:     19:00 a 23:00
 */

interface SlotRange {
  start: string; // HH:mm inclusivo
  end: string; // HH:mm inclusivo
}

export const SLOT_INTERVAL_MINUTES = 30;

export const SERVICE_RANGES: SlotRange[] = [
  { start: '12:00', end: '15:00' },
  { start: '19:00', end: '23:00' },
];

/** Máximo de días hacia adelante en que se permite reservar. */
export const MAX_DAYS_AHEAD = 30;

/** Convierte 'HH:mm' a minutos desde medianoche. Devuelve null si es inválido. */
export function timeToMinutes(time: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

/** Genera todas las franjas horarias válidas en formato 'HH:mm'. */
export function generateValidSlots(): string[] {
  const slots: string[] = [];
  for (const range of SERVICE_RANGES) {
    const start = timeToMinutes(range.start)!;
    const end = timeToMinutes(range.end)!;
    for (let m = start; m <= end; m += SLOT_INTERVAL_MINUTES) {
      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      const mm = String(m % 60).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

/** Indica si una hora 'HH:mm' corresponde a una franja válida. */
export function isValidSlot(time: string): boolean {
  return generateValidSlots().includes(time);
}
