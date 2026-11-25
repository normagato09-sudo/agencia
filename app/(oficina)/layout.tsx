import Link from 'next/link';
import { redirect } from 'next/navigation';
import { estaDentro } from '@/lib/auth';
import { agentes, preparar } from '@/lib/db';
import Logo from '@/components/Logo';
import Nav from '@/components/Nav';
import InstalarApp from '@/components/InstalarApp';

export const dynamic = 'force-dynamic';

export default async function OficinaLayout({ children }: { children: React.ReactNode }) {
  if (!(await estaDentro())) redirect('/login');

  let error: string | null = null;
  let total = 0;
  try {
    await preparar();
    total = (await agentes()).length;
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <>
      <header className="cabecera">
        <Link href="/" className="marca"><div className="logo"><Logo /></div>Mi Oficina</Link>
        <Nav />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <InstalarApp />
          <span className="chip" style={{ background: '#13261F', color: '#6EE7B7' }}><span className="punto" style={{ background: 'var(--verde)' }} />{total} agentes</span>
          <div className="inicial" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--ambar)' }}>N</div>
        </div>
      </header>
      <div className="contenido">
        {error ? (
          <div className="tarjeta" style={{ maxWidth: 640, lineHeight: 1.6 }}>
            <h2>Falta conectar la base de datos</h2>
            <p className="suave">En Vercel → tu proyecto → <b>Storage</b> → <b>Create Database</b> → <b>Neon</b> → conéctala a este proyecto y vuelve a desplegar.</p>
            <p className="peq suave">Detalle: {error}</p>
          </div>
        ) : children}
      </div>
    </>
  );
}
