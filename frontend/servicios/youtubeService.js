// Servicio sin clave para buscar trailers en YouTube usando APIs públicas
// Fallback 1: Piped (https://piped.video)
// Fallback 2: Invidious (yewtu.be)

const PIPED_SEARCH = 'https://piped.video/api/v1/search';
const YEWTU_SEARCH = 'https://yewtu.be/api/v1/search';

// Normalización con eliminación de acentos y puntuación común
const normalizarTitulo = (texto = '') => texto
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '') // quitar acentos
  .replace(/[^a-z0-9\s:]/g, '') // quitar puntuación (mantener ":" para títulos largos)
  .replace(/\s+/g, ' ') // colapsar espacios  
  .trim();

// Mapeo manual de trailers por título normalizado (películas/series)
const MANUAL_TRAILERS = {
  'afterburn zona cero': 'https://www.youtube.com/watch?v=cPxrfeENIZM',
  'la guerra de los mundos': 'https://www.youtube.com/watch?v=F760LlRPlFg',
  'culpa nuestra': 'https://www.youtube.com/watch?v=qUYK8QIfLvc',
  'zona de caza': 'https://www.youtube.com/watch?v=kUaLX88WZ_8',
  'guardianes de la noche kimetsu no yaiba la fortaleza infinita': 'https://www.youtube.com/watch?v=2VBpXfRma9c',
  'chainsaw man la pelicula el arco de reze': 'https://www.youtube.com/watch?v=NNFw1IOezYY',
  'it bienvenidos a derry': 'https://www.youtube.com/watch?v=CCwW2e7Ux0A',
  // Solicitud del usuario: reproducir este enlace al presionar "Ver"
  'the witcher': 'https://www.youtube.com/watch?v=Werbt-YSfy0',
  // Captain Hook - The Cursed Tides
  'captain hook the cursed tides': 'https://www.youtube.com/watch?v=VVrs2GQmUOs',
  // DAN DA DAN
  'dan da dan': 'https://www.youtube.com/watch?v=hoLZUi05DnA',
};

// Mapeo manual específico para episodios (clave: "<serie> episodio <n> <nombre>")
const MANUAL_EPISODIOS = {
  // Ejemplo solicitado: IT: Bienvenidos a Derry - Episodio 1: Piloto
  // URL: Secuencia inicial | IT: Bienvenidos a Derry | HBO Max Latinoamérica
  'it bienvenidos a derry episodio 1 piloto': 'https://www.youtube.com/watch?v=CCwW2e7Ux0A',
  // Episodio 2: Esa cosa en la penumbra
  'it bienvenidos a derry episodio 2 esa cosa en la penumbra': 'https://www.youtube.com/watch?v=YPv8KWCokc8',
  // Solicitud del usuario: reproducir este enlace también al ver el episodio 1
  'the witcher episodio 1 el principio del fin': 'https://www.youtube.com/watch?v=Werbt-YSfy0',
  // DAN DA DAN - Episodio 2: Eso de ahí es un alien, ¿no?
  // Normalización elimina acentos y signos: "eso de ahi es un alien no"
  'dan da dan episodio 2 eso de ahi es un alien no': 'https://www.youtube.com/watch?v=EkRnToOLRl0',
};

export function obtenerTrailerManual(titulo) {
  if (!titulo) return null;
  const key = normalizarTitulo(titulo).replace(/:\s*/g, ' ');
  // Intento exacto
  if (MANUAL_TRAILERS[key]) return MANUAL_TRAILERS[key];
  // Heurística: buscar coincidencias por inclusión para títulos largos
  const entries = Object.entries(MANUAL_TRAILERS);
  const hit = entries.find(([k]) => key.includes(k));
  return hit ? hit[1] : null;
}

export function obtenerTrailerManualEpisodio(serieTitulo, episodioNumero, episodioNombre) {
  if (!serieTitulo || !episodioNumero || !episodioNombre) return null;
  const key = normalizarTitulo(`${serieTitulo} episodio ${episodioNumero} ${episodioNombre}`).replace(/:\s*/g, ' ');
  if (MANUAL_EPISODIOS[key]) return MANUAL_EPISODIOS[key];
  // Heurística: permitir coincidencias por inclusión (por si el nombre del episodio difiere levemente)
  const entries = Object.entries(MANUAL_EPISODIOS);
  const hit = entries.find(([k]) => key.includes(k));
  return hit ? hit[1] : null;
}

const esTrailer = (titulo = '') => {
  const t = normalizarTitulo(titulo);
  return (
    t.includes('trailer') ||
    t.includes('tráiler') ||
    t.includes('teaser')
  );
};

const esOficial = (titulo = '') => {
  const t = normalizarTitulo(titulo);
  return t.includes('official') || t.includes('oficial');
};

const aWatchUrl = (idOrUrl) => {
  if (!idOrUrl) return null;
  // Si nos dan un ID directamente
  if (!idOrUrl.startsWith('http')) {
    if (idOrUrl.startsWith('/watch')) {
      return `https://www.youtube.com${idOrUrl}`;
    }
    return `https://www.youtube.com/watch?v=${idOrUrl}`;
  }

  // Si es una URL completa, normalizar siempre a youtube.com
  try {
    const u = new URL(idOrUrl);
    // Obtener videoId desde cualquier host si existe parámetro "v"
    const vid = u.searchParams.get('v');
    if (vid) return `https://www.youtube.com/watch?v=${vid}`;

    // URLs tipo youtu.be/<id>
    const pathname = (u.pathname || '').replace(/^\/+/, '');
    if ((u.hostname || '').includes('youtu.be') && pathname) {
      return `https://www.youtube.com/watch?v=${pathname.split(/[?&]/)[0]}`;
    }

    // Si ya es youtube.com simplemente devolverla
    if ((u.hostname || '').includes('youtube.com')) return idOrUrl;

    // Fallback: devolver tal cual si no podemos normalizar
    return idOrUrl;
  } catch (_) {
    return idOrUrl;
  }
};

async function buscarEnPiped(query) {
  try {
    const res = await fetch(`${PIPED_SEARCH}?q=${encodeURIComponent(query)}&region=ES`);
    const items = await res.json();
    if (!Array.isArray(items)) return null;
    // Priorizar tráiler oficial
    const candidatos = items.filter(i => i.type === 'video' && esTrailer(i.title));
    const oficial = candidatos.find(i => esOficial(i.title)) || candidatos[0];
    if (!oficial) return null;
    // En piped suele venir i.url = "/watch?v=ID"
    return aWatchUrl(oficial.url);
  } catch (_) { return null; }
}

async function buscarEnYewtu(query) {
  try {
    const res = await fetch(`${YEWTU_SEARCH}?q=${encodeURIComponent(query)}&type=video`);
    const items = await res.json();
    if (!Array.isArray(items)) return null;
    const candidatos = items.filter(i => i.type === 'video' && esTrailer(i.title));
    const oficial = candidatos.find(i => esOficial(i.title)) || candidatos[0];
    if (!oficial) return null;
    const id = oficial.videoId || oficial.id;
    return aWatchUrl(id);
  } catch (_) { return null; }
}

export async function buscarTrailerEnYouTube(titulo, year) {
  // Prioridad: mapeo manual brindado por el usuario
  const manual = obtenerTrailerManual(titulo);
  if (manual) return aWatchUrl(manual);

  if (!titulo) return null;
  const queries = [
    `${titulo} trailer oficial ${year || ''}`.trim(),
    `${titulo} official trailer ${year || ''}`.trim(),
    `${titulo} tráiler oficial`.trim(),
    `${titulo} official teaser`.trim(),
  ];
  for (const q of queries) {
    const fromPiped = await buscarEnPiped(q);
    if (fromPiped) return fromPiped;
    const fromYewtu = await buscarEnYewtu(q);
    if (fromYewtu) return fromYewtu;
  }
  return null;
}