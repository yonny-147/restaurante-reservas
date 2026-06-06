import styles from './LoadingSpinner.module.scss';

interface LoadingSpinnerProps {
  label?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({ label = 'Cargando...', fullPage = false }: LoadingSpinnerProps) {
  return (
    <div className={fullPage ? styles.fullPage : styles.inline} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
