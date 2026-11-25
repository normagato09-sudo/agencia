import type { Metadata, Viewport } from 'next';
import './globals.css';
import RegistrarSW from '@/components/RegistrarSW';

export const metadata: Metadata = {
  title: 'Mi Oficina',
  description: 'Tus agentes de IA en un solo sitio',
  manifest: '/manifest.json',
  icons: { icon: '/icono.svg', apple: '/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: 'Mi Oficina', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = { themeColor: '#0E1116', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body><RegistrarSW />{children}</body>
    </html>
  );
}
