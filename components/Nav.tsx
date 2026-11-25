'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ENLACES = [
  { href: '/', texto: 'Centro de mando' },
  { href: '/ciudad', texto: 'Ciudad' },
  { href: '/sede', texto: 'Agentes' },
  { href: '/avisos', texto: 'Avisos' },
];

export default function Nav() {
  const ruta = usePathname();
  return (
    <nav className="nav">
      {ENLACES.map((e) => {
        const activo = e.href === '/' ? ruta === '/' : ruta.startsWith(e.href) || (e.href === '/ciudad' && ruta.startsWith('/edificio'));
        return <Link key={e.href} href={e.href} className={activo ? 'activo' : ''}>{e.texto}</Link>;
      })}
    </nav>
  );
}
