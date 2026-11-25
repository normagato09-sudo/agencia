import type { Agente } from '@/lib/db';

export default function AgenteTarjeta({ a, color, pendientes, proyecto }: { a: Agente; color: string; pendientes: number; proyecto?: string }) {
  const trabajando = a.estado === 'trabajando' || pendientes > 0;
  return (
    <div className={`agente ${trabajando ? 'trabajando' : ''}`} style={pendientes ? { borderColor: '#4A2626' } : undefined}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="inicial" style={{ width: 34, height: 34, borderRadius: '50%', background: color }}>{a.nombre.slice(0, 1)}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{a.nombre}</div>
          <div className="peq suave">{proyecto ? `${proyecto} · ` : ''}{a.app}</div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: '#C9D1D9', lineHeight: 1.4 }}>{a.trabajo}</div>
      {pendientes > 0
        ? <span className="peq" style={{ color: 'var(--rojo)', fontWeight: 600 }}>● Tiene {pendientes} {pendientes === 1 ? 'aviso' : 'avisos'} para ti</span>
        : <span className={trabajando ? 'estado-t' : 'estado-e'}>{trabajando ? '● Trabajando' : '○ Esperando'}</span>}
    </div>
  );
}
