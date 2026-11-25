import Link from 'next/link';
import Chat from '@/components/Chat';
import AvisoTarjeta from '@/components/AvisoTarjeta';
import ActivarAvisos from '@/components/ActivarAvisos';
import { datosOficina, iniciales } from '@/lib/vista';

export default async function CentroDeMando() {
  const d = await datosOficina();
  const fijos = d.pend.filter((a) => a.nivel === 'urgente');
  const resto = d.ultimos.filter((a) => !(a.nivel === 'urgente' && !a.leido));

  return (
    <div className="tres-col">
      <section className="col-lado">
        <h2>Mis proyectos</h2>
        {d.ps.map((p) => {
          const n = d.agentesPor(p.slug).length;
          const pend = d.pendientesPor(p.slug);
          return (
            <Link key={p.slug} href={p.slug === 'agentes' ? '/sede' : `/edificio/${p.slug}`} className="proyecto">
              <div className="inicial" style={{ background: p.color }}>{iniciales(p.nombre)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                <div className="peq suave">{n === 0 ? 'Sin agentes por ahora' : `${n} ${n === 1 ? 'agente' : 'agentes'}`}</div>
              </div>
              {pend > 0 && <span className="globo">{pend}</span>}
            </Link>
          );
        })}
        <Link href="/ciudad" className="tarjeta" style={{ textAlign: 'center', borderStyle: 'dashed' }}>Ver la ciudad →</Link>
      </section>

      <div className="col-centro">
        <Chat iniciales={d.chat} nombres={d.nombreAgente} />
      </div>

      <section className="col-lado">
        <h2>Lo que te han dicho</h2>
        <ActivarAvisos />
        {fijos.map((a) => (
          <AvisoTarjeta key={a.id} a={a} proyecto={d.proyectoDe[a.proyecto ?? '']?.nombre ?? ''} color={d.proyectoDe[a.proyecto ?? '']?.color ?? '#fff'} agente={d.nombreAgente[a.agente ?? ''] ?? ''} />
        ))}
        {resto.length === 0 && fijos.length === 0 && <div className="tarjeta suave">Todavía no hay avisos. En cuanto un agente tenga algo que contarte, aparecerá aquí.</div>}
        {resto.slice(0, 8).map((a) => (
          <AvisoTarjeta key={a.id} a={a} proyecto={d.proyectoDe[a.proyecto ?? '']?.nombre ?? ''} color={d.proyectoDe[a.proyecto ?? '']?.color ?? '#fff'} agente={d.nombreAgente[a.agente ?? ''] ?? ''} />
        ))}
        <Link href="/avisos" className="tarjeta" style={{ textAlign: 'center', borderStyle: 'dashed' }}>Todos los avisos →</Link>
      </section>
    </div>
  );
}
