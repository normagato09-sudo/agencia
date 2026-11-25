'use client';
import { useEffect, useState } from 'react';

function aBytes(base64: string) {
  const relleno = '='.repeat((4 - (base64.length % 4)) % 4);
  const b = atob((base64 + relleno).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...b].map((c) => c.charCodeAt(0)));
}

export default function ActivarAvisos() {
  const [estado, setEstado] = useState<'cargando' | 'no-soportado' | 'activo' | 'inactivo' | 'bloqueado'>('cargando');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return setEstado('no-soportado');
      if (Notification.permission === 'denied') return setEstado('bloqueado');
      const reg = await navigator.serviceWorker.ready;
      setEstado((await reg.pushManager.getSubscription()) ? 'activo' : 'inactivo');
    })();
  }, []);

  async function activar() {
    setError('');
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== 'granted') return setEstado('bloqueado');
      const { publica } = await (await fetch('/api/push')).json();
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: aBytes(publica) });
      const r = await fetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) });
      if (!r.ok) throw new Error('No se pudo guardar');
      setEstado('activo');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (estado === 'cargando') return null;
  if (estado === 'activo') return <span className="chip" style={{ color: '#6EE7B7' }}><span className="punto" style={{ background: 'var(--verde)' }} />Notificaciones activadas en este dispositivo</span>;
  if (estado === 'no-soportado') return <span className="peq suave">Este navegador no admite notificaciones. En iPhone: añade Mi Oficina a la pantalla de inicio y ábrela desde ahí.</span>;
  if (estado === 'bloqueado') return <span className="peq suave">Las notificaciones están bloqueadas. Actívalas en los ajustes del navegador para esta web.</span>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button className="btn" onClick={activar}>Activar notificaciones en este dispositivo</button>
      {error && <span className="peq" style={{ color: 'var(--rojo)' }}>{error}</span>}
    </div>
  );
}
