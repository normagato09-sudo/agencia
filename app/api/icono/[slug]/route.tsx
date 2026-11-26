import { ImageResponse } from 'next/og';
import { PROYECTOS } from '@/lib/seed';

// Icono de cada proyecto para las notificaciones del móvil (cuadrado de su color con sus iniciales).
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = PROYECTOS.find((x) => x.slug === slug);
  const color = p?.color ?? '#2DD4BF';
  const iniciales = (p?.nombre ?? 'MO').replace(/[^A-Za-zÁÉÍÓÚÑ ]/g, '').trim().slice(0, 2).toUpperCase();
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: color, color: '#0E1116', fontSize: 80, fontWeight: 800, borderRadius: 40 }}>
        {iniciales}
      </div>
    ),
    { width: 192, height: 192, headers: { 'Cache-Control': 'public, max-age=86400' } },
  );
}
