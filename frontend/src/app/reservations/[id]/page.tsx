'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Ban,
  CalendarDays,
  Check,
  CheckCheck,
  Clock,
  Mail,
  Phone,
  Sofa,
  Table2,
  User,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  cancelReservation,
  getReservation,
  updateReservation,
} from '@/lib/api/reservations';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatDateTime, formatLongDate } from '@/lib/utils/formatDate';
import type { Reservation, ReservationStatus } from '@/lib/types';
import styles from './page.module.scss';

const TIMELINE: { status: ReservationStatus; label: string }[] = [
  { status: 'PENDING', label: 'Pendiente' },
  { status: 'CONFIRMED', label: 'Confirmada' },
  { status: 'SEATED', label: 'En mesa' },
  { status: 'COMPLETED', label: 'Completada' },
];

export default function ReservationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReservation(await getReservation(id));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(status: ReservationStatus) {
    setActing(true);
    setError(null);
    try {
      setReservation(await updateReservation(id, { status }));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActing(false);
    }
  }

  async function confirmCancel() {
    setActing(true);
    setError(null);
    try {
      setReservation(await cancelReservation(id));
      setModalOpen(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActing(false);
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Cargando reserva…" />;

  if (error && !reservation) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBanner}>{error}</div>
        <Button variant="outline" onClick={() => router.push('/reservations')}>
          Volver a la lista
        </Button>
      </div>
    );
  }

  if (!reservation) return null;

  const isCancelled = reservation.status === 'CANCELLED';
  const currentIndex = TIMELINE.findIndex((s) => s.status === reservation.status);

  return (
    <div className={styles.page}>
      <Link href="/reservations" className={styles.back}>
        <ArrowLeft size={16} /> Volver a la lista
      </Link>

      <div className={styles.headerRow}>
        <h1>Reserva de {reservation.customerName}</h1>
        <Badge status={reservation.status} />
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.card}>
        <h2>Detalles</h2>
        <dl className={styles.details}>
          <div>
            <dt><User size={15} /> Cliente</dt>
            <dd>{reservation.customerName}</dd>
          </div>
          <div>
            <dt><Mail size={15} /> Correo</dt>
            <dd>{reservation.customerEmail}</dd>
          </div>
          <div>
            <dt><Phone size={15} /> Teléfono</dt>
            <dd>{reservation.customerPhone}</dd>
          </div>
          <div>
            <dt><CalendarDays size={15} /> Fecha</dt>
            <dd>{formatLongDate(reservation.date)}</dd>
          </div>
          <div>
            <dt><Clock size={15} /> Hora</dt>
            <dd>{reservation.time}</dd>
          </div>
          <div>
            <dt><Users size={15} /> Personas</dt>
            <dd>{reservation.partySize}</dd>
          </div>
          <div>
            <dt><Table2 size={15} /> Mesa</dt>
            <dd>{reservation.tableId ? `Mesa ${reservation.tableId}` : 'Sin asignar'}</dd>
          </div>
          <div>
            <dt><Clock size={15} /> Creada</dt>
            <dd>{formatDateTime(reservation.createdAt)}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.card}>
        <h2>Estado de la reserva</h2>
        {isCancelled ? (
          <div className={styles.cancelledBox}>
            <Ban size={20} /> Esta reserva fue cancelada.
          </div>
        ) : (
          <ol className={styles.timeline}>
            {TIMELINE.map((step, i) => {
              const done = i <= currentIndex;
              const active = i === currentIndex;
              return (
                <li
                  key={step.status}
                  className={`${styles.tlStep} ${done ? styles.done : ''} ${active ? styles.active : ''}`}
                >
                  <span className={styles.tlDot}>
                    {done ? <Check size={14} /> : i + 1}
                  </span>
                  <span className={styles.tlLabel}>{step.label}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {!isCancelled && reservation.status !== 'COMPLETED' && (
        <div className={styles.actions}>
          {reservation.status === 'PENDING' && (
            <Button
              variant="primary"
              leftIcon={<Check size={18} />}
              isLoading={acting}
              onClick={() => changeStatus('CONFIRMED')}
            >
              Confirmar
            </Button>
          )}
          {reservation.status === 'CONFIRMED' && (
            <Button
              variant="primary"
              leftIcon={<Sofa size={18} />}
              isLoading={acting}
              onClick={() => changeStatus('SEATED')}
            >
              Marcar en mesa
            </Button>
          )}
          {reservation.status === 'SEATED' && (
            <Button
              variant="primary"
              leftIcon={<CheckCheck size={18} />}
              isLoading={acting}
              onClick={() => changeStatus('COMPLETED')}
            >
              Completar
            </Button>
          )}
          <Button
            variant="danger"
            leftIcon={<Ban size={18} />}
            disabled={acting}
            onClick={() => setModalOpen(true)}
          >
            Cancelar reserva
          </Button>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Cancelar reserva"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={acting}>
              No, mantener
            </Button>
            <Button variant="danger" isLoading={acting} onClick={confirmCancel}>
              Sí, cancelar
            </Button>
          </>
        }
      >
        <p>
          ¿Seguro que deseas cancelar la reserva de{' '}
          <strong>{reservation.customerName}</strong> para el{' '}
          {formatLongDate(reservation.date)} a las {reservation.time}? Esta acción
          liberará la mesa.
        </p>
      </Modal>
    </div>
  );
}
