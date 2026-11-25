import Link from 'next/link';
import Chat from '@/components/Chat';
import AvisoTarjeta from '@/components/AvisoTarjeta';
import ActivarAvisos from '@/components/ActivarAvisos';
import { recordatoriosDeHoy } from '@/lib/db';
import { datosOficina, iniciales } from '@/lib/vista';

function saludo() {
  const h = Number(new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid', hour: 'numeric', hour12: false }));
  return h < 6 ? 'Buenas noches' : h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
}

export default async function Inicio() {
  const [d, hoyRec] = await Promise.all([datosOficina(), recordatoriosDeHoy()]);
  const fijos = d.pend.filter((a) => a.nivel === 'urgente');
  const trabajando = d.ags.filter((a) => a.estado === 'trabajando').length;
  const fecha = new Date().toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long' });
  const proxRec = hoyRec.find((r) => !r.enviado) ?? hoyRec[0];
  const datoDe = (a: { proyecto: string | null; agente: string | null }) => ({
    proyecto: d.proyectoDe[a.proyecto ?? '']?.nombre ?? '',
    color: d.proyectoDe[a.proyecto ?? '']?.color ?? '#fff',
    agente: d.nombreAgente[a.agente ?? ''] ?? '',
  });

  return (
    <div className="inicio">
      {/* Saludo */}
      <div>
        <h1 className="saludo">{saludo()}, Norma</h1>
        <div className="suave" style={{ marginTop: 4, textTransform: 'capitalize' }}>{fecha}</div>
      </div>

      {/* Resumen del día */}
      <div className="resumen">
        <Link href="/avisos" className={`res-tarjeta ${fijos.length ? 'res-urgente' : ''}`}>
          <span className="res-etiqueta">Urgente</span>
          <span className="res-num">{fijos.length}</span>
          <span className="res-texto">{fijos.length ? fijos[0].titulo : 'Nada urgente'}</span>
        </Link>
        <Link href="/avisos" className="res-tarjeta">
          <span className="res-etiqueta">Sin ver</span>
          <span className="res-num">{d.pend.length}</span>
          <span className="res-texto">{d.pend.length ? `${d.pend.length === 1 ? 'aviso' : 'avisos'} de tus agentes` : 'Todo al día'}</span>
        </Link>
        <div className="res-tarjeta">
          <span className="res-etiqueta">Hoy</span>
          <span className="res-num">{hoyRec.length}</span>
          <span className="res-texto">{proxRec ? `${proxRec.hora} · ${proxRec.texto}` : 'Sin recordatorios'}</span>
        </div>
        <Link href="/ciudad" className="res-tarjeta">
          <span className="res-etiqueta">Trabajando</span>
          <span className="res-num" style={{ color: '#F5D27A' }}>{trabajando}</span>
          <span className="res-texto">de {d.ags.length} agentes</span>
        </Link>
      </div>

      {/* Avisos fijos: siempre arriba hasta que pulses «Visto» */}
      {fijos.map((a) => <AvisoTarjeta key={a.id} a={a} {...datoDe(a)} />)}

      {/* Proyectos en una fila deslizable */}
      <div className="proyectos-fila" aria-label="Mis proyectos">
        {d.ps.map((p) => {
          const pend = d.pendientesPor(p.slug);
          return (
            <Link key={p.slug} href={p.slug === 'agentes' ? '/sede' : `/edificio/${p.slug}`} className="proyecto-chip">
              <span className="inicial" style={{ width: 26, height: 26, borderRadius: 7, fontSize: 11, background: p.color }}>{iniciales(p.nombre)}</span>
              {p.nombre.split(' ')[0]}
              {pend > 0 && <span className="globo" style={{ minWidth: 18, height: 18, fontSize: 11 }}>{pend}</span>}
            </Link>
          );
        })}
      </div>

      {/* Chat (lo principal) + últimos avisos al lado en el ordenador */}
      <div className="inicio-cuerpo">
        <div className="inicio-chat">
          <Chat iniciales={d.chat} nombres={d.nombreAgente} />
        </div>
        <aside className="inicio-lado solo-escritorio">
          <ActivarAvisos />
          <h2>Últimos avisos</h2>
          {d.ultimos.filter((a) => !(a.nivel === 'urgente' && !a.leido)).slice(0, 5).map((a) => (
            <AvisoTarjeta key={a.id} a={a} {...datoDe(a)} />
          ))}
          {d.ultimos.length === 0 && <div className="tarjeta suave">Todavía no hay avisos.</div>}
          <Link href="/avisos" className="tarjeta" style={{ textAlign: 'center', borderStyle: 'dashed' }}>Todos los avisos →</Link>
        </aside>
      </div>
    </div>
  );
}
