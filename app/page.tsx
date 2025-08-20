// app/page.tsx
"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <main style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #eaf6ef 0%, #f4f8fb 100%)',
      borderRadius: '18px',
      boxShadow: '0 2px 16px rgba(44,62,80,0.08)',
      marginTop: '32px',
      marginBottom: '32px',
      padding: '2.5rem 1.2rem',
      maxWidth: 600,
      marginLeft: 'auto',
      marginRight: 'auto',
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        color: '#3c8dbc',
        marginBottom: 12,
        letterSpacing: '-1px',
        textAlign: 'center',
      }}>
        Materias UTN
      </h1>
      <p style={{
        fontSize: '1.2rem',
        color: '#333',
        marginBottom: 32,
        textAlign: 'center',
        maxWidth: 460,
      }}>
        Gestioná tu plan de estudios, visualizá tu progreso y mantené tus materias organizadas de forma simple y visual.
      </p>
      <Link href="/tabla" style={{ textDecoration: 'none' }}>
        <button style={{
          fontSize: '1.1rem',
          padding: '14px 38px',
          background: '#3c8dbc',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 700,
          boxShadow: '0 2px 12px rgba(44,62,80,0.07)',
          letterSpacing: '0.5px',
          cursor: 'pointer',
          transition: 'background 0.2s, box-shadow 0.2s',
        }}>
          Inciar
        </button>
      </Link>
      <div style={{ marginTop: 40, color: '#888', fontSize: '0.98rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span>Hecho por <strong>Ignacio Galoppo</strong></span>
          <div style={{ display: 'flex', gap: 16, marginTop: 2 }}>
            <a href="https://www.linkedin.com/in/ignacio-galoppo-b9623a184" target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 256">
                <path d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453" fill="#0A66C2"/>
              </svg>
            </a>
            <a href="https://github.com/galoppoignacio/" target="_blank" rel="noopener noreferrer" title="GitHub" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="6" fill="#222"/><path d="M16 7.333c-4.6 0-8.333 3.733-8.333 8.333 0 3.68 2.387 6.8 5.693 7.907.42.08.573-.18.573-.4v-1.387c-2.313.507-2.8-1.12-2.8-1.12-.38-.96-.92-1.213-.92-1.213-.76-.52.06-.507.06-.507.84.06 1.28.867 1.28.867.747 1.28 1.96.913 2.44.693.073-.547.293-.913.533-1.12-1.847-.213-3.787-.92-3.787-4.093 0-.907.32-1.653.853-2.24-.087-.213-.373-1.08.08-2.253 0 0 .693-.227 2.267.853.66-.187 1.373-.28 2.08-.28.707 0 1.42.093 2.08.28 1.573-1.08 2.267-.853 2.267-.853.453 1.173.167 2.04.08 2.253.533.587.853 1.333.853 2.24 0 3.187-1.947 3.88-3.8 4.093.3.253.567.76.567 1.547v2.293c0 .22.153.48.573.4C21.947 22.467 24.333 19.347 24.333 15.667c0-4.6-3.733-8.334-8.333-8.334z" fill="white"/></svg>
            </a>
          </div>
        </div>
      </div>
      </main>
    </>
  );
}
