import { headers } from 'next/headers';
import AgenteTarjeta from '@/components/AgenteTarjeta';
import { crearAgente } from '@/app/acciones';
import { claveEventos } from '@/lib/ajustes';
import { datosOficina } from '@/lib/vista';

export default async function Sede({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto } = await searchParams;
  const d = await datosOficina();
  const trabajando = d.ags.filter((a) => a.estado === 'trabajando').length;
  const clave = await claveEventos();
  const h = await headers();
  const base = `https://${h.get('host')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1>Sede AGENTES</h1>
          <p className="suave" style={{ margin: '4px 0 0' }}>Todos tus agentes en un solo sitio. Desde aquí los creas y decides a qué app se conectan.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="tarjeta"><b style={{ fontSize: 18 }}>{d.ags.length}</b> <span className="suave">agentes</span></div>
          <div className="tarjeta"><b style={{ fontSize: 18, color: '#F5D27A' }}>{trabajando}</b> <span className="suave">trabajando</span></div>
          <div className="tarjeta"><b style={{ fontSize: 18, color: 'var(--rojo)' }}>{d.pend.length}</b> <span className="suave">avisos sin ver</span></div>
        </div>
      </div>

      <div className="tres-col">
        <div className="col-centro rejilla3" style={{ alignContent: 'start' }}>
          {d.ags.map((a) => (
            <AgenteTarjeta key={a.slug} a={a} color={d.proyectoDe[a.proyecto]?.color ?? '#fff'} proyecto={d.proyectoDe[a.proyecto]?.nombre}
              pendientes={d.pend.filter((x) => x.agente === a.slug).length} />
          ))}
        </div>

        <div className="col-lado" style={{ maxWidth: 400 }}>
          <form id="nuevo" action={crearAgente} className="tarjeta" style={{ display: 'flex', flexDirection: 'column', gap: 10, borderColor: 'var(--acento)' }}>
            <h2>Crear agente nuevo</h2>
            <label className="peq suave">Nombre<input name="nombre" required placeholder="Ej.: Repaso de exámenes" /></label>
            <label className="peq suave">Proyecto
              <select name="proyecto" defaultValue={proyecto ?? 'agentes'}>
                {d.ps.map((p) => <option key={p.slug} value={p.slug}>{p.nombre}</option>)}
              </select>
            </label>
            <label className="peq suave">Planta (grupo)<input name="planta" placeholder="Ej.: Clientes, Redes…" /></label>
            <label className="peq suave">App que vigila<input name="app" placeholder="Ej.: ORGANIZATOR" /></label>
            <label className="peq suave">Su trabajo<textarea name="trabajo" rows={3} placeholder="Qué tiene que vigilar y cuándo avisarte" /></label>
            <button className="btn" type="submit">Crear agente</button>
          </form>

          <div className="tarjeta" style={{ display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.5 }}>
            <h2>Conectar tus apps</h2>
            <p className="suave peq" style={{ margin: 0 }}>Tus otras apps avisan a un agente enviando esto. Esta clave es secreta: no la compartas.</p>
            <pre className="codigo">{`POST ${base}/api/eventos
Authorization: Bearer ${clave}

{ "agente": "lanzora-solicitudes",
  "nivel": "urgente",
  "titulo": "Solicitud nueva",
  "texto": "…" }`}</pre>
            <p className="suave peq" style={{ margin: 0 }}>Nombres de agente: {d.ags.map((a) => a.slug).join(', ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
