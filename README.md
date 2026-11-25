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
- 20:00 → el agente de Puntos te recuerda marcar lo que has hecho.

## Más adelante

- Conectar cada app (Lanzora, Mi Dinero, ORGANIZATOR, Rubiko, Fútbol, CIFA) a su agente.
- Enchufar la IA en `lib/chat.ts` para poder hablar normal con los agentes.
