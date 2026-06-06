import { z } from 'zod';
import { getTimeSlots } from '@/lib/utils/timeSlots';
import { dateFromToday, todayISO } from '@/lib/utils/formatDate';

const validSlots = getTimeSlots();

export const reservationSchema = z.object({
  customerName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'El nombre es demasiado largo'),
  customerEmail: z.string().email('Introduce un correo válido'),
  customerPhone: z
    .string()
    .regex(/^[+]?[\d\s-]{7,20}$/, 'Introduce un teléfono válido'),
  date: z
    .string()
    .min(1, 'Selecciona una fecha')
    .refine((d) => d >= todayISO(), 'La fecha no puede ser pasada')
    .refine((d) => d <= dateFromToday(30), 'Máximo 30 días en el futuro'),
  time: z
    .string()
    .min(1, 'Selecciona una franja horaria')
    .refine((t) => validSlots.includes(t), 'Franja horaria no válida'),
  partySize: z.coerce
    .number({ invalid_type_error: 'Indica el número de personas' })
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 persona')
    .max(20, 'Máximo 20 personas'),
  tableId: z.coerce.number().int().positive().optional(),
});

export type ReservationFormValues = z.infer<typeof reservationSchema>;
