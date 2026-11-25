import Link from 'next/link';
import { notFound } from 'next/navigation';
import AgenteTarjeta from '@/components/AgenteTarjeta';
import AvisoTarjeta from '@/components/AvisoTarjeta';
import { datosOficina } from '@/lib/vista';
import Recordatorios from '@/components/Recordatorios';
import { recordatorios } from '@/lib/db';

export default async function Edificio({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await datosOficina();
  const p = d.proyectoDe[slug];
  if (!p) notFound();
  const ags = d.agentesPor(slug);
  const plantas = [...new Set(ags.map((a) => a.planta || 'General'))];
  const avisosProyecto = d.ultimos.filter((a) => a.proyecto === slug);
  const pendientes = await recordatorios({ proyecto: slug });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <Link href="/ciudad" className="peq suave">← Volver a la ciudad</Link>
          <h1 style={{ marginTop: 6 }}>{p.tipo === 'casa' ? 'Casa' : 'Edificio'} {p.nombre}</h1>
          <p className="suave" style={{ margin: '4px 0 0' }}>{ags.length ? `${ags.length} ${ags.length === 1 ? 'agente' : 'agentes'} trabajando para ti.` : 'Este proyecto aún no tiene agentes.'}</p>
        </div>
        <Link href={`/sede?proyecto=${slug}#nuevo`} className="btn sec">+ Crear agente aquí</Link>
      </div>

      <div className="tres-col">
        <div className="col-centro" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ags.length === 0 && <div className="tarjeta suave">Las luces están apagadas. Cuando quieras que un agente vigile este proyecto, créalo desde aquí.</div>}
          {plantas.map((planta, i) => (
            <div key={planta} className="planta">
              <div className="planta-nombre">
                <div className="peq suave">Planta {plantas.length - i}</div>
                <div className="titulo" style={{ fontWeight: 600, fontSize: 17 }}>{planta}</div>
              </div>
              <div className="rejilla3" style={{ flex: 1, minWidth: 260 }}>
                {ags.filter((a) => (a.planta || 'General') === planta).map((a) => (
                  <AgenteTarjeta key={a.slug} a={a} color={p.color} pendientes={d.pend.filter((x) => x.agente === a.slug).length} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <section className="col-lado">
          <Recordatorios agentes={ags} lista={pendientes} nombres={d.nombreAgente} />
          <h2>Avisos de {p.nombre}</h2>
          {avisosProyecto.length === 0 && <div className="tarjeta suave">Sin avisos todavía.</div>}
          {avisosProyecto.map((a) => (
            <AvisoTarjeta key={a.id} a={a} proyecto={p.nombre} color={p.color} agente={d.nombreAgente[a.agente ?? ''] ?? ''} />
          ))}
        </section>
      </div>
    </div>
  );
}
