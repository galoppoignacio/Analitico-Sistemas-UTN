"use client";
import Link from "next/link";
import { useState } from "react";
import styles from './Navbar.module.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className={styles.navbar}>
      <div className={styles.hamburger} onClick={() => setOpen((v) => !v)}>
        <span style={{ transform: open ? 'rotate(45deg) translateY(8px)' : undefined }}></span>
        <span style={{ opacity: open ? 0 : 1 }}></span>
        <span style={{ transform: open ? 'rotate(-45deg) translateY(-8px)' : undefined }}></span>
      </div>
      <div className={styles["navbar-content"] + (open ? ' ' + styles.open : '')} onClick={() => setOpen(false)}>
  <Link href="/" className={styles["navbar-link"]}>Inicio</Link>
  <Link href="/tabla" className={styles["navbar-link"]}>Analitico</Link>
  <Link href="/disponibles" className={styles["navbar-link"]}>Materias Disponibles</Link>
  <Link href="/estadisticas" className={styles["navbar-link"]}>Estadísticas</Link>
      </div>
    </nav>
  );
}
