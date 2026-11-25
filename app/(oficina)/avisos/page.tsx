import ActivarAvisos from '@/components/ActivarAvisos';
import AvisoTarjeta from '@/components/AvisoTarjeta';
import { cerrarSesion, marcarTodoLeido, probarAviso } from '@/app/acciones';
import { avisos } from '@/lib/db';
import { datosOficina } from '@/lib/vista';

const NIVELES = [
  { nivel: 'normal', titulo: 'Mensaje en el chat', color: 'var(--suave)', texto: 'Para lo normal. Te lo escriben en el chat y lo lees cuando entras.' },
  { nivel: 'importante', titulo: 'Notificación', color: 'var(--ambar)', texto: 'Para lo importante. Te llega al móvil u ordenador aunque Mi Oficina esté cerrada.' },
  { nivel: 'urgente', titulo: 'Aviso fijo', color: 'var(--rojo)', texto: 'Para lo urgente. Notificación + se queda arriba del todo hasta que pulsas «Visto».' },
];

export default async function Avisos() {
  const d = await datosOficina();
  const todos = await avisos({ limite: 100 });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1100 }}>
      <div>
        <h1>Cómo te avisan</h1>
        <p className="suave" style={{ margin: '4px 0 0' }}>Todo pasa dentro de Mi Oficina. Según lo importante que sea, el agente elige cómo avisarte.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {NIVELES.map((n) => (
          <form key={n.nivel} action={probarAviso} className="tarjeta" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="peq" style={{ color: n.color, fontWeight: 700 }}>{n.nivel.toUpperCase()}</div>
            <div className="titulo" style={{ fontSize: 18, fontWeight: 600 }}>{n.titulo}</div>
            <div className="suave" style={{ lineHeight: 1.45, flex: 1 }}>{n.texto}</div>
            <input type="hidden" name="nivel" value={n.nivel} />
            <button className="btn sec" style={{ alignSelf: 'flex-start', padding: '7px 12px', fontSize: 13 }}>Probar</button>
          </form>
        ))}
      </div>
      <div className="tarjeta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <ActivarAvisos />
        <span className="peq suave">Resumen de la mañana: 08:00 · Recordatorio de Puntos: 20:00</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Historial</h2>
        <form action={marcarTodoLeido}><button className="btn sec" style={{ padding: '7px 12px', fontSize: 13 }}>Marcar todo como visto</button></form>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {todos.length === 0 && <div className="tarjeta suave">Aún no hay avisos. Pulsa «Probar» arriba para ver cómo llegan.</div>}
        {todos.map((a) => (
          <AvisoTarjeta key={a.id} a={a} proyecto={d.proyectoDe[a.proyecto ?? '']?.nombre ?? ''} color={d.proyectoDe[a.proyecto ?? '']?.color ?? '#fff'} agente={d.nombreAgente[a.agente ?? ''] ?? ''} />
        ))}
      </div>
      <form action={cerrarSesion}><button className="btn sec" style={{ fontSize: 13 }}>Cerrar sesión</button></form>
    </div>
  );
}
