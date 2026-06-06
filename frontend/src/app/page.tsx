import Link from 'next/link';
import {
  CalendarCheck,
  ClipboardList,
  MousePointerClick,
  Sparkles,
  Table2,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './page.module.scss';

const FEATURES = [
  {
    icon: <CalendarCheck size={28} />,
    title: 'Reserva fácil',
    text: 'Elige fecha, hora y número de personas en menos de un minuto, desde cualquier dispositivo.',
  },
  {
    icon: <Zap size={28} />,
    title: 'Confirmación inmediata',
    text: 'Recibe el estado de tu reserva al instante y haz seguimiento de cada paso.',
  },
  {
    icon: <Table2 size={28} />,
    title: 'Gestión de mesas',
    text: 'Asignación automática de la mejor mesa o elige tú mismo entre las disponibles.',
  },
];

const STEPS = [
  {
    icon: <MousePointerClick size={26} />,
    title: 'Completa el formulario',
    text: 'Ingresa tus datos y la franja horaria que prefieras.',
  },
  {
    icon: <Sparkles size={26} />,
    title: 'Confirmamos tu mesa',
    text: 'Validamos disponibilidad y reservamos la mejor mesa para ti.',
  },
  {
    icon: <ClipboardList size={26} />,
    title: 'Gestiona tu reserva',
    text: 'Consulta, confirma o cancela tu reserva cuando quieras.',
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.kicker}>
            <Sparkles size={16} /> Reservas en línea
          </span>
          <h1>La Buena Mesa</h1>
          <p>
            Cocina de autor en un ambiente acogedor. Reserva tu mesa en segundos
            y vive una experiencia gastronómica inolvidable.
          </p>
          <div className={styles.actions}>
            <Link href="/reservations/new">
              <Button variant="accent" size="lg">
                Hacer Reserva
              </Button>
            </Link>
            <Link href="/reservations">
              <Button variant="outline" size="lg">
                Ver reservas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>¿Por qué reservar con nosotros?</h2>
        <div className={styles.cards}>
          {FEATURES.map((f) => (
            <article key={f.title} className={styles.card}>
              <div className={styles.cardIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.steps}`}>
        <h2>¿Cómo funciona?</h2>
        <div className={styles.cards}>
          {STEPS.map((s, i) => (
            <article key={s.title} className={styles.step}>
              <span className={styles.stepNumber}>{i + 1}</span>
              <div className={styles.stepIcon}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
