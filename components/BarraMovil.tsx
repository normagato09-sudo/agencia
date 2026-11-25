'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Barra de pestañas abajo, solo en el móvil.
const ICONOS: Record<string, React.ReactNode> = {
  inicio: <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" />,
  ciudad: <path d="M3 21V9l6-4v16M9 21V3l6 3v15M15 21v-9l6 3v6M2 21h20" />,
  agentes: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.6.9 2.6 2.6 3 5.2" /></>,
  avisos: <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9zM10 20a2 2 0 0 0 4 0" />,
};
const PESTANAS = [
  { href: '/', texto: 'Inicio', icono: 'inicio' },
  { href: '/ciudad', texto: 'Ciudad', icono: 'ciudad' },
  { href: '/sede', texto: 'Agentes', icono: 'agentes' },
  { href: '/avisos', texto: 'Avisos', icono: 'avisos' },
];

export default function BarraMovil({ pendientes }: { pendientes: number }) {
  const ruta = usePathname();
  return (
    <nav className="barra-movil" aria-label="Secciones">
      {PESTANAS.map((p) => {
        const activo = p.href === '/' ? ruta === '/' : ruta.startsWith(p.href) || (p.href === '/ciudad' && ruta.startsWith('/edificio'));
        return (
          <Link key={p.href} href={p.href} className={activo ? 'activo' : ''} aria-current={activo ? 'page' : undefined}>
            <span style={{ position: 'relative' }}>
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ICONOS[p.icono]}</svg>
              {p.icono === 'avisos' && pendientes > 0 && <span className="globo globo-barra">{pendientes > 9 ? '9+' : pendientes}</span>}
            </span>
            {p.texto}
          </Link>
        );
      })}
    </nav>
  );
}
