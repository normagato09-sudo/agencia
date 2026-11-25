// Vercel llama a los /api/cron/* solo. Si pones CRON_SECRET en Vercel, solo Vercel podrá llamarlos.
export function cronPermitido(req: Request) {
  const s = process.env.CRON_SECRET;
  return !s || req.headers.get('authorization') === `Bearer ${s}`;
}
