import { marcarLeido } from '@/app/acciones';
import type { Aviso } from '@/lib/db';

const ETIQUETA = { normal: 'Chat', importante: 'Notificación', urgente: 'Aviso fijo' } as const;

function hace(fecha: string) {
  const min = Math.round((Date.now() - new Date(fecha).getTime()) / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' });
}

export default function AvisoTarjeta({ a, proyecto, color, agente }: { a: Aviso; proyecto: string; color: string; agente: string }) {
  return (
    <div className={`aviso ${a.nivel === 'urgente' && !a.leido ? 'urgente' : ''} ${a.leido ? 'leido' : ''}`}>
      <div className="aviso-cab">
        <span style={{ color: a.nivel === 'urgente' ? 'var(--rojo)' : color, fontWeight: 700 }}>
          {a.nivel === 'urgente' ? 'URGENTE · ' : ''}{proyecto} · {agente}
        </span>
        <span>{hace(a.creado)}</span>
      </div>
      <div style={{ marginTop: 6, lineHeight: 1.45, fontWeight: 500 }}>{a.titulo}</div>
      {a.texto && <div className="suave" style={{ marginTop: 4, lineHeight: 1.45, whiteSpace: 'pre-line' }}>{a.texto}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span className="peq suave">{ETIQUETA[a.nivel]}</span>
        {!a.leido && (
          <form action={marcarLeido}>
            <input type="hidden" name="id" value={a.id} />
            <button className="btn sec" style={{ padding: '6px 10px', fontSize: 12 }}>Visto</button>
          </form>
        )}
      </div>
    </div>
  );
}
