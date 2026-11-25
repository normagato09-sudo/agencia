'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Mensaje = { id: number; de: 'norma' | 'agente'; agente: string | null; texto: string; creado: string };

export default function Chat({ iniciales, nombres }: { iniciales: Mensaje[]; nombres: Record<string, string> }) {
  const [lista, setLista] = useState<Mensaje[]>(iniciales);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const abajo = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => { abajo.current?.scrollIntoView({ block: 'end' }); }, [lista.length]);

  // Cada 15 s mira si algún agente te ha escrito.
  useEffect(() => {
    const t = setInterval(async () => {
      const r = await fetch('/api/chat').catch(() => null);
      if (!r?.ok) return;
      const { mensajes } = (await r.json()) as { mensajes: Mensaje[] };
      setLista((antes) => {
        if (mensajes.length && mensajes[mensajes.length - 1].id !== antes[antes.length - 1]?.id) { router.refresh(); return mensajes; }
        return antes;
      });
    }, 15000);
    return () => clearInterval(t);
  }, [router]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto }) });
    if (r.ok) {
      const { mensajes } = (await r.json()) as { mensajes: Mensaje[] };
      setLista((l) => [...l, ...mensajes]);
      setTexto('');
      router.refresh();
    }
    setEnviando(false);
  }

  return (
    <section className="chat">
      <div className="chat-cab">
        <div className="inicial" style={{ borderRadius: '50%', background: '#1E3A5F', color: '#93C5FD' }}>S</div>
        <div>
          <div style={{ fontWeight: 600 }}>Secretaria general</div>
          <div className="peq suave">Aquí te escriben todos tus agentes, y tú les contestas</div>
        </div>
      </div>
      <div className="chat-lista">
        {lista.length === 0 && <div className="suave">Aún no hay mensajes. Escribe «resumen» para empezar.</div>}
        {lista.map((m) => (
          <div key={m.id} className={`msg ${m.de === 'norma' ? 'mio' : 'suyo'}`}>
            {m.de === 'agente' && <span className="quien">{nombres[m.agente ?? ''] ?? 'Agente'}</span>}
            {m.texto}
          </div>
        ))}
        <div ref={abajo} />
      </div>
      <form className="chat-pie" onSubmit={enviar}>
        <label htmlFor="msg" style={{ position: 'absolute', left: -9999 }}>Escribe a tus agentes</label>
        <input id="msg" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe… (ej.: «¿qué tengo pendiente?»)" autoComplete="off" />
        <button className="btn" type="submit" disabled={enviando} aria-label="Enviar">Enviar</button>
      </form>
    </section>
  );
}
