'use client';
import { useEffect, useRef, useState } from 'react';

const MI_VERSION = process.env.NEXT_PUBLIC_VERSION;

/**
 * Detecta si hay una versión nueva de Mi Oficina:
 * - Si vuelves a la app (estaba en segundo plano) → se actualiza sola.
 * - Si la estás usando → aparece el botón «Actualizar» para no cortarte a medias.
 */
export default function Actualizar() {
  const [hayNueva, setHayNueva] = useState(false);
  const nueva = useRef(false);

  useEffect(() => {
    if (!MI_VERSION || MI_VERSION === 'local') return;

    async function comprobar() {
      try {
        const r = await fetch('/api/version', { cache: 'no-store' });
        const { version } = (await r.json()) as { version: string };
        if (version && version !== MI_VERSION) {
          nueva.current = true;
          setHayNueva(true);
          (await navigator.serviceWorker?.getRegistration())?.update().catch(() => {});
        }
      } catch { /* sin conexión: ya lo intentará luego */ }
    }

    async function alVolver() {
      if (document.visibilityState !== 'visible') return;
      await comprobar();
      if (nueva.current) location.reload(); // al volver a la app: se actualiza sola
    }

    comprobar();
    const t = setInterval(comprobar, 2 * 60 * 1000);
    document.addEventListener('visibilitychange', alVolver);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', alVolver); };
  }, []);

  if (!hayNueva) return null;
  return (
    <div role="status" style={{
      position: 'fixed', left: '50%', bottom: 20, transform: 'translateX(-50%)', zIndex: 50,
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 10px 10px 16px', borderRadius: 14,
      background: '#161B22', border: '1px solid var(--acento)', boxShadow: '0 8px 30px rgba(0,0,0,.45)', maxWidth: 'calc(100vw - 32px)',
    }}>
      <span>Hay una versión nueva de Mi Oficina.</span>
      <button className="btn" style={{ padding: '8px 14px' }} onClick={() => location.reload()}>Actualizar</button>
    </div>
  );
}
