"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { useAuth } from "./authContext";

// Responsive navbar con Tailwind + Next.js
// - Celeste/Azul de fondo
// - Menú hamburguesa en mobile
// - Link activo resaltado
// - Accesible (aria-* + focus-visible)

const links = [
  // { href: "/", label: "Inicio" },
  { href: "/tabla", label: "Analítico" },
  { href: "/disponibles", label: "Materias Disponibles" },
  { href: "/estadisticas", label: "Estadísticas" },
  { href: "/pasantias", label: "Pasantías" },
];


export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const isActive = useCallback(
    (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href)),
    [pathname]
  );

  const baseItem =
    "text-white rounded-lg px-3 py-2 text-[0.95rem] font-medium transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

  const activeItem = "bg-white/10 ring-1 ring-white/70 ring-offset-2 ring-offset-sky-800 shadow-sm";

  const closeMenu = () => setOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-sky-700 via-sky-800 to-blue-900 text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-2 py-1 font-semibold tracking-wide text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            onClick={closeMenu}
          >
            <span className="text-xl leading-none">📘</span>
            <span className="hidden md:inline">Materias Ingenieria en Sistemas UTN FRC</span>
            <span className="md:hidden">Materias Ing. Sistemas UTN FRC</span>
          </Link>
        </div>

        {/* Botón hamburguesa (mobile) */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl p-2 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:hidden"
          aria-controls="mobile-menu"
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          {/* Ícono hamburguesa simple en SVG */}
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {open ? (
              // X
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              // Hamburguesa
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>

        {/* Links (desktop) */}
        <div className="hidden gap-1 md:flex items-center">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`${baseItem} ${isActive(l.href) ? activeItem : ""}`}
              aria-current={isActive(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <button
              onClick={logout}
              className={`${baseItem} ${activeItem}`}
              style={{ marginLeft: 16 }}
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </div>

      {/* Menú mobile desplegable */}
      <div
        id="mobile-menu"
        className={`grid origin-top md:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} transition-[grid-template-rows] duration-300 ease-out`}
      >
        <div className="overflow-hidden">
          <div className="mx-auto max-w-6xl px-3 pb-3 pt-1 sm:px-4">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={closeMenu}
                  className={`${baseItem} ${isActive(l.href) ? activeItem : ""}`}
                  aria-current={isActive(l.href) ? "page" : undefined}
                >
                  {l.label}
                </Link>
              ))}
              {user && (
                <button
                  onClick={() => { logout(); closeMenu(); }}
                  className={`${baseItem} ${activeItem} mt-2`}
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
