'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Mensaje = {
  id: number; de: 'norma' | 'agente'; agente: string | null; texto: string; creado: string;
  aviso_id: number | null; aviso_titulo: string | null; aviso_texto: string | null; aviso_nivel: 'normal' | 'importante' | 'urgente' | null;
  aviso_leido: boolean | null; aviso_url: string | null; aviso_proyecto: string | null;
};
export type InfoAgente = { nombre: string; proyecto: string; proyectoNombre: string; color: string };

const iniciales = (n: string) => n.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, '').trim().slice(0, 2).toUpperCase();
const hora = (f: string) => new Date(f).toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' });
const dia = (f: string) => new Date(f).toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long' });

/** En cada línea «Etiqueta: valor», la etiqueta va en negrita. */
function Texto({ t }: { t: string }) {
  return (
    <>
      {t.split('\n').map((l, i) => {
        const m = l.match(/^([•\-]\s*)?([^:]{1,40}):\s(.+)$/);
        return <div key={i}>{m ? <>{m[1] ?? ''}<b>{m[2]}:</b> {m[3]}</> : l}</div>;
      })}
    </>
  );
}

function Aviso({ m, info, onAccion, onResponder }: {
  m: Mensaje; info?: InfoAgente; onAccion: (accion: 'hecho' | 'tarde', cuando?: string) => Promise<void>; onResponder: () => void;
}) {
  const [menuTarde, setMenuTarde] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const urgente = m.aviso_nivel === 'urgente' && !m.aviso_leido;
  const hecho = !!m.aviso_leido;
  const accion = async (a: 'hecho' | 'tarde', c?: string) => { setOcupado(true); await onAccion(a, c); setOcupado(false); setMenuTarde(false); };

  return (
    <div className="aviso-chat">
      <div className="avatar-agente" style={{ background: info?.color ?? '#9BA7B4' }}>{iniciales(info?.proyectoNombre ?? '?')}</div>
      <div style={{ minWidth: 0, maxWidth: '84%' }}>
        <div className={`aviso-cab-chat ${urgente ? 'rojo' : ''}`}>
          {info?.proyectoNombre} · {info?.nombre} · {urgente ? 'URGENTE' : hora(m.creado)}
        </div>
        <div className={`burbuja-aviso ${urgente ? 'urgente' : ''} ${hecho ? 'hecho' : ''}`}>
          <div className="aviso-titulo">{m.aviso_titulo}</div>
          {m.aviso_texto && <div className="aviso-cuerpo"><Texto t={m.aviso_texto} /></div>}
        </div>
        <div className="botones-aviso">
          {m.aviso_url && (
            <a className="pildora principal" href={m.aviso_url} target={m.aviso_url.startsWith('/') ? undefined : '_blank'} rel="noreferrer">↗ Abrir</a>
          )}
          <button type="button" className="pildora" onClick={onResponder}>Responder</button>
          {!hecho && (
            <>
              <button type="button" className="pildora" disabled={ocupado} onClick={() => setMenuTarde((v) => !v)} aria-expanded={menuTarde}>Más tarde</button>
              <button type="button" className="pildora" disabled={ocupado} onClick={() => accion('hecho')}>✓ Hecho</button>
            </>
          )}
          {hecho && <span className="pildora apagada">✓ Hecho</span>}
        </div>
        {menuTarde && !hecho && (
          <div className="botones-aviso">
            <button type="button" className="pildora" disabled={ocupado} onClick={() => accion('tarde', '1h')}>En 1 hora</button>
            <button type="button" className="pildora" disabled={ocupado} onClick={() => accion('tarde', 'tarde')}>Esta tarde</button>
            <button type="button" className="pildora" disabled={ocupado} onClick={() => accion('tarde', 'manana')}>Mañana</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Chat({ iniciales: inicio, agentes }: { iniciales: Mensaje[]; agentes: Record<string, InfoAgente> }) {
  const [lista, setLista] = useState<Mensaje[]>(inicio);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [respondiendo, setRespondiendo] = useState<Mensaje | null>(null);
  const [nota, setNota] = useState('');
  const abajo = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => { abajo.current?.scrollIntoView({ block: 'end' }); }, [lista.length]);

  const recargar = async () => {
    const r = await fetch('/api/chat', { cache: 'no-store' }).catch(() => null);
    if (!r?.ok) return;
    setLista(((await r.json()) as { mensajes: Mensaje[] }).mensajes);
  };

  // Cada 15 s mira si algún agente te ha escrito.
  useEffect(() => {
    const t = setInterval(async () => {
      const r = await fetch('/api/chat', { cache: 'no-store' }).catch(() => null);
      if (!r?.ok) return;
      const { mensajes } = (await r.json()) as { mensajes: Mensaje[] };
      setLista((antes) => {
        if (mensajes.length && mensajes[mensajes.length - 1].id !== antes[antes.length - 1]?.id) { router.refresh(); return mensajes; }
        return antes;
      });
    }, 15000);
    return () => clearInterval(t);
  }, [router]);

  async function accionAviso(m: Mensaje, accion: 'hecho' | 'tarde', cuando?: string) {
    const r = await fetch(`/api/avisos/${m.aviso_id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion, cuando }) });
    if (r.ok) {
      const j = (await r.json()) as { mensaje: string };
      setLista((l) => l.map((x) => (x.aviso_id === m.aviso_id ? { ...x, aviso_leido: true } : x)));
      setNota(j.mensaje);
      setTimeout(() => setNota(''), 3500);
      router.refresh();
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    const r = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto, avisoId: respondiendo?.aviso_id ?? undefined }),
    });
    if (r.ok) {
      setTexto('');
      setRespondiendo(null);
      await recargar();
      router.refresh();
    }
    setEnviando(false);
  }

  let diaAnterior = '';
  return (
    <section className="chat">
      <div className="chat-cab">
        <div className="inicial" style={{ borderRadius: '50%', background: '#1E3A5F', color: '#93C5FD' }}>S</div>
        <div>
          <div style={{ fontWeight: 600 }}>Tus agentes</div>
          <div className="peq suave">Cada aviso es un mensaje con botones</div>
        </div>
      </div>
      <div className="chat-lista">
        {lista.length === 0 && <div className="suave">Aún no hay mensajes. Escribe «resumen» para empezar.</div>}
        {lista.map((m) => {
          const d = dia(m.creado);
          const separador = d !== diaAnterior ? <div className="separador-dia">{d}</div> : null;
          diaAnterior = d;
          const info = m.agente ? agentes[m.agente] : undefined;
          return (
            <div key={m.id} style={{ display: 'contents' }}>
              {separador}
              {m.aviso_id ? (
                <Aviso m={m} info={info} onAccion={(a, c) => accionAviso(m, a, c)}
                  onResponder={() => { setRespondiendo(m); entrada.current?.focus(); }} />
              ) : m.de === 'norma' ? (
                <div className="msg mio">{m.texto}</div>
              ) : (
                <div className="aviso-chat">
                  <div className="avatar-agente" style={{ background: info && m.agente !== 'secretaria' ? info.color : '#1E3A5F', color: info && m.agente !== 'secretaria' ? '#0E1116' : '#93C5FD' }}>
                    {info && m.agente !== 'secretaria' ? iniciales(info.proyectoNombre) : 'S'}
                  </div>
                  <div style={{ minWidth: 0, maxWidth: '84%' }}>
                    <div className="aviso-cab-chat">{info?.nombre ?? 'Secretaria general'} · {hora(m.creado)}</div>
                    <div className="msg suyo" style={{ maxWidth: '100%' }}>{m.texto}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {nota && <div className="nota-flotante" role="status">{nota}</div>}
        <div ref={abajo} />
      </div>
      {respondiendo && (
        <div className="respondiendo">
          <span>Respondiendo a <b>{agentes[respondiendo.agente ?? '']?.nombre ?? 'agente'}</b>: {respondiendo.aviso_titulo}</span>
          <button type="button" className="btn sec" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setRespondiendo(null)} aria-label="Cancelar respuesta">✕</button>
        </div>
      )}
      <form className="chat-pie" onSubmit={enviar}>
        <label htmlFor="msg" style={{ position: 'absolute', left: -9999 }}>Escribe a tus agentes</label>
        <input id="msg" ref={entrada} value={texto} onChange={(e) => setTexto(e.target.value)}
          placeholder={respondiendo ? 'Escribe tu respuesta…' : 'Responde a tus agentes… (ej.: «resumen»)'} autoComplete="off" />
        <button className="btn" type="submit" disabled={enviando} aria-label="Enviar">Enviar</button>
      </form>
    </section>
  );
}
