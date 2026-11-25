import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Devuelve la versión que está publicada ahora mismo en Vercel.
export function GET() {
  return NextResponse.json(
    { version: process.env.VERCEL_GIT_COMMIT_SHA || 'local' },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
