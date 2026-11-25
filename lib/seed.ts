// Proyectos y agentes iniciales de Mi Oficina.
// Se insertan solo si no existen (no pisan cambios hechos desde la app).

export type Tipo = 'sede' | 'edificio' | 'casa';

export const PROYECTOS: { slug: string; nombre: string; tipo: Tipo; color: string; orden: number }[] = [
  { slug: 'agentes', nombre: 'AGENTES', tipo: 'sede', color: '#E6EDF3', orden: 0 },
  { slug: 'lanzora', nombre: 'Lanzora', tipo: 'edificio', color: '#F5B342', orden: 1 },
  { slug: 'cifa', nombre: 'CIFA', tipo: 'edificio', color: '#2DD4BF', orden: 2 },
  { slug: 'defensem', nombre: 'DEFENSEM l’Empordanet', tipo: 'edificio', color: '#A78BFA', orden: 3 },
  { slug: 'rubiko', nombre: 'Rubiko', tipo: 'edificio', color: '#FB923C', orden: 4 },
  { slug: 'mi-dinero', nombre: 'Mi Dinero', tipo: 'casa', color: '#34D399', orden: 5 },
  { slug: 'organizator', nombre: 'ORGANIZATOR', tipo: 'casa', color: '#60A5FA', orden: 6 },
  { slug: 'puntos', nombre: 'Puntos', tipo: 'casa', color: '#F472B6', orden: 7 },
  { slug: 'lego', nombre: 'LEGO', tipo: 'casa', color: '#FACC15', orden: 8 },
  { slug: 'futbol', nombre: 'Fútbol', tipo: 'casa', color: '#F87171', orden: 9 },
];

export const AGENTES: { slug: string; proyecto: string; nombre: string; planta: string; app: string; trabajo: string }[] = [
  { slug: 'secretaria', proyecto: 'agentes', nombre: 'Secretaria general', planta: 'Dirección', app: 'Todas tus apps', trabajo: 'Te hace el resumen de cada mañana y coordina a todos los agentes.' },

  { slug: 'lanzora-solicitudes', proyecto: 'lanzora', nombre: 'Solicitudes', planta: 'Clientes', app: 'lanzora.net/solicitar', trabajo: 'Te avisa de cada solicitud nueva.' },
  { slug: 'lanzora-tickets', proyecto: 'lanzora', nombre: 'Tickets', planta: 'Clientes', app: 'Discord de Lanzora', trabajo: 'Te avisa cuando alguien abre un ticket en Discord.' },
  { slug: 'lanzora-valoraciones', proyecto: 'lanzora', nombre: 'Valoraciones', planta: 'Clientes', app: 'Panel de clientes', trabajo: 'Te avisa cuando un cliente deja su valoración.' },
  { slug: 'lanzora-instagram', proyecto: 'lanzora', nombre: 'Instagram', planta: 'Redes', app: '@lanzoraa', trabajo: 'Te recuerda qué colgar en Instagram.' },
  { slug: 'lanzora-tiktok', proyecto: 'lanzora', nombre: 'TikTok', planta: 'Redes', app: '@holalanzora', trabajo: 'Te recuerda qué colgar en TikTok.' },
  { slug: 'lanzora-proyectos', proyecto: 'lanzora', nombre: 'Proyectos y entregas', planta: 'Trabajo', app: 'Panel de Lanzora', trabajo: 'Te avisa si un proyecto se retrasa o alguien entrega su parte.' },
  { slug: 'lanzora-pagos', proyecto: 'lanzora', nombre: 'Pagos', planta: 'Trabajo', app: 'Panel de Lanzora', trabajo: 'Te avisa de anticipos y segundas mitades pendientes.' },

  { slug: 'cifa-reuniones', proyecto: 'cifa', nombre: 'Reuniones', planta: 'Dirección', app: 'App de reuniones', trabajo: 'Te avisa antes de cada reunión y si cambia un horario.' },
  { slug: 'cifa-inscripciones', proyecto: 'cifa', nombre: 'Inscripciones', planta: 'Formación', app: 'Cursos de CIFA', trabajo: 'Te avisa cuando alguien se inscribe en un curso.' },
  { slug: 'cifa-cursos', proyecto: 'cifa', nombre: 'Cursos', planta: 'Formación', app: 'Cursos de CIFA', trabajo: 'Te avisa cuando empieza un curso y de alumnos sin confirmar.' },

  { slug: 'rubiko-profesor', proyecto: 'rubiko', nombre: 'Profesor de cubos', planta: 'Aprender', app: 'Rubiko', trabajo: 'Te enseña algoritmos nuevos de cada cubo.' },
  { slug: 'rubiko-plan', proyecto: 'rubiko', nombre: 'Plan semanal', planta: 'Aprender', app: 'Rubiko', trabajo: 'Te prepara el entrenamiento de la semana y te recuerda practicar.' },

  { slug: 'dinero-pagos', proyecto: 'mi-dinero', nombre: 'Pagos de mañana', planta: 'Casa', app: 'Mi Dinero', trabajo: 'Te avisa de que mañana toca pagar algo.' },
  { slug: 'dinero-resumen', proyecto: 'mi-dinero', nombre: 'Resumen de gastos', planta: 'Casa', app: 'Mi Dinero', trabajo: 'Cada semana o mes te dice cuánto has gastado y en qué.' },

  { slug: 'organizator-examenes', proyecto: 'organizator', nombre: 'Exámenes y entregas', planta: 'Casa', app: 'ORGANIZATOR', trabajo: 'Te avisa de exámenes, deberes y entregas.' },
  { slug: 'puntos-diario', proyecto: 'puntos', nombre: 'Recordatorio diario', planta: 'Casa', app: 'App de puntos', trabajo: 'Te recuerda marcar lo que has hecho ese día.' },
  { slug: 'futbol-partidos', proyecto: 'futbol', nombre: 'Partidos', planta: 'Casa', app: 'Barça · España · Athletic', trabajo: 'Te avisa cuando juegan el Barça, España y el Athletic Club.' },
];
