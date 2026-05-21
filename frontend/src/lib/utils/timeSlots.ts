// Genera las franjas horarias válidas: cada 30 min en 12:00-15:00 y 19:00-23:00.

const RANGES: Array<{ start: string; end: string }> = [
  { start: '12:00', end: '15:00' },
  { start: '19:00', end: '23:00' },
];

const SLOT_INTERVAL_MINUTES = 30;

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function toLabel(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export function getTimeSlots(): string[] {
  const slots: string[] = [];
  for (const range of RANGES) {
    for (
      let m = toMinutes(range.start);
      m <= toMinutes(range.end);
      m += SLOT_INTERVAL_MINUTES
    ) {
      slots.push(toLabel(m));
    }
  }
  return slots;
}
