'use client';
import { useEffect, useState } from 'react';

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// Botón «Instalar Mi Oficina». En Android/ordenador abre el instalador; en iPhone explica los pasos.
export default function InstalarApp({ grande = false }: { grande?: boolean }) {
  const [evento, setEvento] = useState<EventoInstalar | null>(null);
  const [instalada, setInstalada] = useState(true);
  const [esIOS, setEsIOS] = useState(false);
  const [ayuda, setAyuda] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
    setInstalada(standalone);
    setEsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const alPreparar = (e: Event) => { e.preventDefault(); setEvento(e as EventoInstalar); };
    const alInstalar = () => { setInstalada(true); setEvento(null); };
    window.addEventListener('beforeinstallprompt', alPreparar);
    window.addEventListener('appinstalled', alInstalar);
    return () => { window.removeEventListener('beforeinstallprompt', alPreparar); window.removeEventListener('appinstalled', alInstalar); };
  }, []);

  if (instalada) return null;

  async function instalar() {
    if (evento) {
      await evento.prompt();
      const { outcome } = await evento.userChoice;
      if (outcome === 'accepted') setInstalada(true);
      setEvento(null);
    } else {
      setAyuda((v) => !v);
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button className={grande ? 'btn' : 'btn sec'} style={grande ? undefined : { padding: '8px 12px', fontSize: 13 }} onClick={instalar}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
        Instalar Mi Oficina
      </button>
      {ayuda && (
        <div className="tarjeta" style={{ position: grande ? 'static' : 'absolute', right: 0, top: 'calc(100% + 8px)', width: 300, zIndex: 10, marginTop: grande ? 10 : 0, lineHeight: 1.5 }}>
          {esIOS ? (
            <>
              <b>En iPhone / iPad (Safari):</b>
              <ol style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                <li>Pulsa el botón <b>Compartir</b> (el cuadrado con la flecha hacia arriba).</li>
                <li>Elige <b>Añadir a pantalla de inicio</b>.</li>
                <li>Abre Mi Oficina desde el icono nuevo y activa las notificaciones.</li>
              </ol>
            </>
          ) : (
            <>
              <b>Para instalarla:</b>
              <ol style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                <li><b>Chrome / Edge (ordenador):</b> icono de instalar en la barra de direcciones, o menú ⋮ → <b>Instalar Mi Oficina</b>.</li>
                <li><b>Android (Chrome):</b> menú ⋮ → <b>Instalar aplicación</b>.</li>
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
}
