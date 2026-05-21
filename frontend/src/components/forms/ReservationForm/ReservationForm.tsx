'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarDays,
  Clock,
  Mail,
  Phone,
  User,
  Users,
  Utensils,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getAvailableTables } from '@/lib/api/tables';
import { getApiErrorMessage } from '@/lib/api/client';
import { getTimeSlots } from '@/lib/utils/timeSlots';
import { dateFromToday, todayISO } from '@/lib/utils/formatDate';
import type { Table } from '@/lib/types';
import { reservationSchema, type ReservationFormValues } from './schema';
import styles from './ReservationForm.module.scss';

const TIME_SLOTS = getTimeSlots();

interface ReservationFormProps {
  onSubmit: (values: ReservationFormValues) => Promise<void>;
  submitError?: string | null;
  isSubmitting?: boolean;
}

export function ReservationForm({
  onSubmit,
  submitError,
  isSubmitting = false,
}: ReservationFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { partySize: 2 },
  });

  const date = watch('date');
  const time = watch('time');

  const [tables, setTables] = useState<Table[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [tablesError, setTablesError] = useState<string | null>(null);

  // Carga mesas disponibles cuando hay fecha y franja válidas.
  useEffect(() => {
    if (!date || !time || !TIME_SLOTS.includes(time)) {
      setTables([]);
      return;
    }
    let cancelled = false;
    setLoadingTables(true);
    setTablesError(null);

    getAvailableTables(date, time)
      .then((data) => {
        if (!cancelled) setTables(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setTablesError(getApiErrorMessage(err));
          setTables([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingTables(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, time]);

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="customerName">
            <User size={16} /> Nombre completo
          </label>
          <input
            id="customerName"
            type="text"
            placeholder="Juan Pérez"
            {...register('customerName')}
          />
          {errors.customerName && (
            <span className={styles.error}>{errors.customerName.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="customerEmail">
            <Mail size={16} /> Correo electrónico
          </label>
          <input
            id="customerEmail"
            type="email"
            placeholder="juan@example.com"
            {...register('customerEmail')}
          />
          {errors.customerEmail && (
            <span className={styles.error}>{errors.customerEmail.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="customerPhone">
            <Phone size={16} /> Teléfono
          </label>
          <input
            id="customerPhone"
            type="tel"
            placeholder="+57 3001234567"
            {...register('customerPhone')}
          />
          {errors.customerPhone && (
            <span className={styles.error}>{errors.customerPhone.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="partySize">
            <Users size={16} /> Personas
          </label>
          <input
            id="partySize"
            type="number"
            min={1}
            max={20}
            {...register('partySize')}
          />
          {errors.partySize && (
            <span className={styles.error}>{errors.partySize.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="date">
            <CalendarDays size={16} /> Fecha
          </label>
          <input
            id="date"
            type="date"
            min={todayISO()}
            max={dateFromToday(30)}
            {...register('date')}
          />
          {errors.date && (
            <span className={styles.error}>{errors.date.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="time">
            <Clock size={16} /> Franja horaria
          </label>
          <select id="time" {...register('time')} defaultValue="">
            <option value="" disabled>
              Selecciona una hora
            </option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          {errors.time && (
            <span className={styles.error}>{errors.time.message}</span>
          )}
        </div>

        <div className={`${styles.field} ${styles.fullSpan}`}>
          <label htmlFor="tableId">
            <Utensils size={16} /> Mesa (opcional)
          </label>
          <select id="tableId" {...register('tableId')} defaultValue="">
            <option value="">Asignación automática</option>
            {tables.map((table) => (
              <option key={table.id} value={table.id}>
                {table.label} · {table.capacity} personas · {table.location}
              </option>
            ))}
          </select>
          {loadingTables && (
            <span className={styles.hint}>Buscando mesas disponibles…</span>
          )}
          {tablesError && <span className={styles.error}>{tablesError}</span>}
          {!loadingTables &&
            !tablesError &&
            date &&
            time &&
            tables.length === 0 && (
              <span className={styles.hint}>
                No hay mesas libres en esa franja; prueba otra hora.
              </span>
            )}
        </div>
      </div>

      {submitError && <div className={styles.submitError}>{submitError}</div>}

      <Button
        type="submit"
        variant="accent"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
      >
        Confirmar reserva
      </Button>
    </form>
  );
}
