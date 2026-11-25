import { borrarRecordatorio, crearRecordatorio } from '@/app/acciones';
import type { Agente, Recordatorio } from '@/lib/db';

const dia = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

// Recordatorios programados: el agente te avisa ese día a esa hora (p. ej. «publicar el reel en Instagram»).
export default function Recordatorios({ agentes, lista, nombres }: { agentes: Agente[]; lista: Recordatorio[]; nombres: Record<string, string> }) {
  if (agentes.length === 0) return null;
  const hoy = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
  return (
    <div className="tarjeta" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h2>Recordatorios</h2>
      <p className="peq suave" style={{ margin: 0 }}>El agente te avisará ese día a esa hora.</p>
      <form action={crearRecordatorio} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label className="peq suave">Qué
          <input name="texto" required maxLength={300} placeholder="Ej.: publicar el reel del proyecto nuevo" />
        </label>
        <label className="peq suave">Agente
          <select name="agente" defaultValue={agentes.find((a) => /instagram/i.test(a.nombre))?.slug ?? agentes[0].slug}>
            {agentes.map((a) => <option key={a.slug} value={a.slug}>{a.nombre}</option>)}
          </select>
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <label className="peq suave" style={{ flex: 1 }}>Día<input name="fecha" type="date" required min={hoy} defaultValue={hoy} /></label>
          <label className="peq suave" style={{ width: 110 }}>Hora<input name="hora" type="time" defaultValue="18:00" /></label>
        </div>
        <button className="btn" type="submit">Añadir recordatorio</button>
      </form>
      {lista.length === 0 && <div className="peq suave">No hay recordatorios pendientes.</div>}
      {lista.map((r) => (
        <div key={r.id} style={{ display: 'flex', gap: 10, alignItems: 'center', borderTop: '1px solid var(--borde)', paddingTop: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500 }}>{r.texto}</div>
            <div className="peq suave">{dia(r.fecha)} · {r.hora} · {nombres[r.agente] ?? r.agente}</div>
          </div>
          <form action={borrarRecordatorio}>
            <input type="hidden" name="id" value={r.id} />
            <button className="btn sec" style={{ padding: '6px 10px', fontSize: 12 }} aria-label={`Borrar ${r.texto}`}>Borrar</button>
          </form>
        </div>
      ))}
    </div>
  );
}
