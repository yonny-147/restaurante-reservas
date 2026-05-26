'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarX2,
  Check,
  Eye,
  Plus,
  RotateCcw,
  Users,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  cancelReservation,
  getReservations,
  updateReservation,
} from '@/lib/api/reservations';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatLongDate } from '@/lib/utils/formatDate';
import type { Reservation, ReservationStatus } from '@/lib/types';
import styles from './page.module.scss';

const STATUS_OPTIONS: ReservationStatus[] = [
  'PENDING',
  'CONFIRMED',
  'SEATED',
  'COMPLETED',
  'CANCELLED',
];

export default function ReservationsListPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | ''>('');
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReservations({
        date: dateFilter || undefined,
        status: statusFilter || undefined,
      });
      setReservations(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleConfirm(id: string) {
    setActingId(id);
    try {
      await updateReservation(id, { status: 'CONFIRMED' });
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  async function handleCancel(id: string) {
    setActingId(id);
    try {
      await cancelReservation(id);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  function clearFilters() {
    setDateFilter('');
    setStatusFilter('');
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Reservas</h1>
          <p>Gestiona todas las reservas del restaurante.</p>
        </div>
        <Link href="/reservations/new">
          <Button variant="accent" leftIcon={<Plus size={18} />}>
            Nueva reserva
          </Button>
        </Link>
      </header>

      <div className={styles.filters}>
        <div className={styles.filterField}>
          <label htmlFor="date">Fecha</label>
          <input
            id="date"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <div className={styles.filterField}>
          <label htmlFor="status">Estado</label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ReservationStatus | '')
            }
          >
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="ghost"
          leftIcon={<RotateCcw size={16} />}
          onClick={clearFilters}
        >
          Limpiar
        </Button>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {loading ? (
        <LoadingSpinner label="Cargando reservas…" />
      ) : reservations.length === 0 ? (
        <div className={styles.empty}>
          <CalendarX2 size={56} />
          <h3>Sin reservas</h3>
          <p>No hay reservas que coincidan con los filtros seleccionados.</p>
          <Link href="/reservations/new">
            <Button variant="accent" leftIcon={<Plus size={18} />}>
              Crear la primera
            </Button>
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {reservations.map((r) => (
            <article key={r.id} className={styles.row}>
              <div className={styles.main}>
                <div className={styles.nameLine}>
                  <strong>{r.customerName}</strong>
                  <Badge status={r.status} />
                </div>
                <span className={styles.meta}>
                  {formatLongDate(r.date)} · {r.time} ·{' '}
                  <Users size={14} /> {r.partySize} ·{' '}
                  {r.tableId ? `Mesa ${r.tableId}` : 'Sin asignar'}
                </span>
              </div>
              <div className={styles.actions}>
                <Link href={`/reservations/${r.id}`}>
                  <Button variant="outline" size="sm" leftIcon={<Eye size={15} />}>
                    Ver
                  </Button>
                </Link>
                {r.status === 'PENDING' && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Check size={15} />}
                    isLoading={actingId === r.id}
                    onClick={() => handleConfirm(r.id)}
                  >
                    Confirmar
                  </Button>
                )}
                {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<X size={15} />}
                    isLoading={actingId === r.id}
                    onClick={() => handleCancel(r.id)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
