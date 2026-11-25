import { redirect } from 'next/navigation';
import { claveConfigurada, entrar, estaDentro } from '@/lib/auth';
import Logo from '@/components/Logo';

export const dynamic = 'force-dynamic';

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await estaDentro()) redirect('/');
  const { error } = await searchParams;

  async function accion(form: FormData) {
    'use server';
    const ok = await entrar(String(form.get('clave') ?? ''));
    redirect(ok ? '/' : '/login?error=1');
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form action={accion} className="tarjeta" style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 14, padding: 24 }}>
        <div className="marca"><div className="logo"><Logo /></div>Mi Oficina</div>
        {!claveConfigurada() ? (
          <p className="suave" style={{ lineHeight: 1.5 }}>
            Falta poner tu contraseña. En Vercel → Settings → Environment Variables, añade <code>OFICINA_CLAVE</code> y vuelve a desplegar.
          </p>
        ) : (
          <>
            <label className="peq suave" htmlFor="clave">Contraseña</label>
            <input id="clave" name="clave" type="password" autoFocus required />
            {error && <div style={{ color: 'var(--rojo)' }}>Contraseña incorrecta.</div>}
            <button className="btn" type="submit">Entrar</button>
          </>
        )}
      </form>
    </main>
  );
}

