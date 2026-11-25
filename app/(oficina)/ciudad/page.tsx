import Link from 'next/link';
import { datosOficina } from '@/lib/vista';

const FONDO: Record<string, string> = {
  agentes: '#1E2633', lanzora: '#2A2440', cifa: '#1B2A44', defensem: '#24203A', rubiko: '#2E2219',
  'mi-dinero': '#162B26', organizator: '#17233A', puntos: '#2C1E2A', lego: '#2A2716', futbol: '#2C1C1C',
};

export default async function Ciudad() {
  const d = await datosOficina();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1>Tu ciudad</h1>
        <p className="suave" style={{ margin: '6px 0 0', maxWidth: 640, lineHeight: 1.5 }}>
          Cada ventana es un agente: encendida si está trabajando o tiene algo que decirte, apagada si espera. Pulsa un edificio para entrar.
        </p>
      </div>
      <div className="ciudad">
        <div className="suelo" /><div className="calle" />
        <div className="edificios">
          {d.ps.map((p) => {
            const ags = d.agentesPor(p.slug);
            const filas = Math.max(1, Math.ceil(ags.length / 3));
            const alto = p.tipo === 'casa' ? 130 : p.tipo === 'sede' ? 200 : 180 + filas * 40;
            const ancho = p.tipo === 'casa' ? 100 : p.tipo === 'sede' ? 120 : 150;
            const pend = d.pendientesPor(p.slug);
            return (
              <Link key={p.slug} href={p.slug === 'agentes' ? '/sede' : `/edificio/${p.slug}`} className="edificio">
                <span className="etiqueta">
                  <span className="punto" style={{ background: pend ? 'var(--rojo)' : ags.length ? 'var(--verde)' : '#5B6573', marginRight: 6 }} />
                  {p.nombre.split(' ')[0]} · {ags.length}
                </span>
                <div className="bloque" style={{ width: ancho, height: alto, background: FONDO[p.slug] ?? '#1E2633', borderTopColor: p.color }}>
                  {ags.map((a) => {
                    const on = a.estado === 'trabajando' || d.pend.some((x) => x.agente === a.slug);
                    return <span key={a.slug} className={`ventana ${on ? 'on' : ''}`} title={a.nombre} />;
                  })}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }} className="peq suave">
        <span><span className="punto" style={{ background: '#F5D27A' }} /> Agente trabajando</span>
        <span><span className="punto" style={{ background: '#2A3550' }} /> Agente esperando</span>
        <span><span className="punto" style={{ background: 'var(--rojo)' }} /> Tiene algo que decirte</span>
      </div>
    </div>
  );
}
