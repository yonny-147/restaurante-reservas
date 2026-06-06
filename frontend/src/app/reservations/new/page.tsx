'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  ReservationForm,
  type ReservationFormValues,
} from '@/components/forms/ReservationForm';
import { createReservation } from '@/lib/api/reservations';
import { getApiErrorMessage } from '@/lib/api/client';
import styles from './page.module.scss';

export default function NewReservationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(values: ReservationFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const reservation = await createReservation({
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        date: values.date,
        time: values.time,
        partySize: values.partySize,
        tableId: values.tableId,
      });
      router.push(`/reservations/${reservation.id}`);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <Link href="/" className={styles.back}>
        <ArrowLeft size={16} /> Volver al inicio
      </Link>

      <header className={styles.header}>
        <h1>Nueva reserva</h1>
        <p>Completa tus datos y reservaremos la mejor mesa disponible.</p>
      </header>

      <div className={styles.card}>
        <ReservationForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      </div>
    </div>
  );
}
