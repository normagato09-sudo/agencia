'use client';
import { useEffect } from 'react';

// Registra el "service worker", que es lo que permite recibir notificaciones con la app cerrada.
export default function RegistrarSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  return null;
}
