'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Aviso } from '@/lib/db';

const iniciales = (n: string) => n.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, '').trim().slice(0, 2).toUpperCase();

function hace(fecha: string) {
  const min = Math.round((Date.now() - new Date(fecha).getTime()) / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' });
}

/** Un aviso con el mismo estilo que en el chat: burbuja del agente y botones. */
export default function AvisoTarjeta({ a, proyecto, color, agente }: { a: Aviso; proyecto: string; color: string; agente: string }) {
  const [hecho, setHecho] = useState(a.leido);
  const [menu, setMenu] = useState(false);
  const [nota, setNota] = useState('');
  const router = useRouter();
  const urgente = a.nivel === 'urgente' && !hecho;

  async function accion(accion: 'hecho' | 'tarde', cuando?: string) {
    const r = await fetch(`/api/avisos/${a.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion, cuando }) });
    if (r.ok) { setHecho(true); setMenu(false); setNota(((await r.json()) as { mensaje: string }).mensaje); router.refresh(); }
  }

  return (
    <div className="aviso-chat">
      <div className="avatar-agente" style={{ background: color }}>{iniciales(proyecto)}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className={`aviso-cab-chat ${urgente ? 'rojo' : ''}`}>{proyecto} · {agente} · {urgente ? 'URGENTE' : hace(a.creado)}</div>
        <div className={`burbuja-aviso ${urgente ? 'urgente' : ''} ${hecho ? 'hecho' : ''}`}>
          <div className="aviso-titulo">{a.titulo}</div>
          {a.texto && <div className="aviso-cuerpo" style={{ whiteSpace: 'pre-line' }}>{a.texto}</div>}
        </div>
        <div className="botones-aviso">
          {a.url && <a className="pildora principal" href={a.url} target={a.url.startsWith('/') ? undefined : '_blank'} rel="noreferrer">↗ Abrir</a>}
          <Link className="pildora" href="/">Responder</Link>
          {!hecho && <button type="button" className="pildora" onClick={() => setMenu((v) => !v)} aria-expanded={menu}>Más tarde</button>}
          {!hecho ? <button type="button" className="pildora" onClick={() => accion('hecho')}>✓ Hecho</button> : <span className="pildora apagada">✓ {nota || 'Hecho'}</span>}
        </div>
        {menu && !hecho && (
          <div className="botones-aviso">
            <button type="button" className="pildora" onClick={() => accion('tarde', '1h')}>En 1 hora</button>
            <button type="button" className="pildora" onClick={() => accion('tarde', 'tarde')}>Esta tarde</button>
            <button type="button" className="pildora" onClick={() => accion('tarde', 'manana')}>Mañana</button>
          </div>
        )}
      </div>
    </div>
  );
}
