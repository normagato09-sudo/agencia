/** Fecha y hora de España (AAAA-MM-DD y HH:MM) de un momento. */
export function enEspana(d: Date): { fecha: string; hora: string } {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(d).map((x) => [x.type, x.value]),
  );
  return { fecha: `${p.year}-${p.month}-${p.day}`, hora: `${p.hour === '24' ? '00' : p.hour}:${p.minute}` };
}

/** Cuándo volver a avisar: en 1 hora, esta tarde (18:00) o mañana (09:00). */
export function cuandoVolver(opcion: string): { fecha: string; hora: string; texto: string } {
  const ahora = new Date();
  if (opcion === 'tarde' || opcion === 'manana') {
    const hoy = enEspana(ahora);
    const manana = enEspana(new Date(ahora.getTime() + 24 * 3600 * 1000)).fecha;
    if (opcion === 'tarde' && hoy.hora < '17:30') return { fecha: hoy.fecha, hora: '18:00', texto: 'esta tarde a las 18:00' };
    if (opcion === 'tarde') return { fecha: manana, hora: '18:00', texto: 'mañana a las 18:00' };
    return { fecha: manana, hora: '09:00', texto: 'mañana a las 09:00' };
  }
  const t = enEspana(new Date(ahora.getTime() + 60 * 60 * 1000));
  return { ...t, texto: `a las ${t.hora}` };
}
