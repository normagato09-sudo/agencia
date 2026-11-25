# Mi Oficina

La app donde viven tus agentes. Tú escribes aquí y ellos te escriben aquí. Te avisan de tres formas:

| Nivel | Cómo te llega |
|---|---|
| normal | Mensaje en el chat |
| importante | Notificación en el móvil u ordenador (aunque la app esté cerrada) |
| urgente | Notificación + aviso fijo arriba del todo hasta que pulsas «Visto» |

## Puesta en marcha (una sola vez, en Vercel)

1. **Base de datos:** Vercel → proyecto *agencia* → **Storage** → **Create Database** → **Neon** → conectar al proyecto.
2. **Contraseña:** Settings → Environment Variables → añade `OFICINA_CLAVE` con la contraseña que quieras.
3. **Redeploy** (Deployments → ⋯ → Redeploy).
4. Entra en la web, pon tu contraseña y pulsa **Activar notificaciones** en cada dispositivo.
   - En iPhone: Safari → Compartir → **Añadir a pantalla de inicio**, y abre Mi Oficina desde ese icono antes de activar las notificaciones.

Las tablas, los proyectos y los 18 agentes se crean solos la primera vez.

## Cómo avisa una app a un agente

```
POST https://<tu-web>/api/eventos
Authorization: Bearer <clave que aparece en la pantalla Agentes>
Content-Type: application/json

{ "agente": "lanzora-solicitudes", "nivel": "urgente", "titulo": "Solicitud nueva", "texto": "…" }
```

## Tareas automáticas (Vercel Cron)

- 08:00 → la Secretaria general te manda el resumen del día.
- 20:00 → Puntos (su propia app) avisa al agente puntos-diario si te faltan tareas por marcar.

## IA (opcional, Claude Haiku 5.5)

1. Crea una clave en console.anthropic.com (con un poco de saldo).
2. En Vercel añade `ANTHROPIC_API_KEY` con esa clave y redeploy.
3. Opcional: `IA_LIMITE_MENSUAL` (en $, por defecto 1). Al llegar al límite, el chat vuelve a las órdenes sencillas hasta el mes siguiente.

El gasto del mes aparece en la pantalla Avisos.

## Cada 10 minutos (GitHub Actions)

`.github/workflows/vigilar.yml` llama a `/api/cron/frecuente`, que:
- manda los **recordatorios** que ya tocan (se crean dentro de cada edificio: p. ej. «publicar en Instagram»);
- mira si hay **tickets nuevos** en el Discord de Lanzora.

## Tickets de Discord (agente lanzora-tickets)

1. discord.com/developers/applications → **New Application** («Mi Oficina») → **Bot** → **Reset Token** y copia el token.
2. **OAuth2 → URL Generator**: marca `bot` y el permiso **View Channels**; abre la URL y añade el bot al servidor de Lanzora.
3. En Discord activa el modo desarrollador (Ajustes → Avanzado) y copia con clic derecho el **ID del servidor** (y, si quieres, el de la categoría de tickets).
4. En Vercel (agencia): `DISCORD_BOT_TOKEN`, `DISCORD_TICKETS_SERVIDOR` y, opcional, `DISCORD_TICKETS_CATEGORIA`. Redeploy.

Sin categoría, cuenta como ticket cualquier canal con «ticket» en el nombre.

## Más adelante

- Conectar cada app (Lanzora, Mi Dinero, ORGANIZATOR, Rubiko, Fútbol, CIFA) a su agente.
