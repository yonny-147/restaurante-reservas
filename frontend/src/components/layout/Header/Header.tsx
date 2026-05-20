'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed } from 'lucide-react';
import styles from './Header.module.scss';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/reservations/new', label: 'Reservar' },
  { href: '/reservations', label: 'Reservas' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <UtensilsCrossed size={24} />
          <span>La Buena Mesa</span>
        </Link>
        <nav className={styles.nav}>
          {NAV.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? styles.active : ''}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
