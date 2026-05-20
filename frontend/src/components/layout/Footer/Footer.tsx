import { UtensilsCrossed } from 'lucide-react';
import styles from './Footer.module.scss';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <UtensilsCrossed size={20} />
          <span>La Buena Mesa</span>
        </div>
        <p>Reserva tu mesa en segundos. Atención: 12:00–15:00 y 19:00–23:00.</p>
        <span className={styles.copy}>© 2026 La Buena Mesa. Proyecto académico.</span>
      </div>
    </footer>
  );
}
