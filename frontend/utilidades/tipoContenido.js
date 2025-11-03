// Función helper para detectar el tipo de contenido de manera consistente
export const detectarTipoContenido = (datos) => {
  if (!datos) return { esSerie: false, tipoHistorial: 'pelicula', tipoTMDB: 'movie' };
  
  // Prioridad 1: Verificar si ya tiene un tipo explícito
  if (datos.tipo === 'serie' || datos.media_type === 'tv') {
    return { esSerie: true, tipoHistorial: 'serie', tipoTMDB: 'tv' };
  }
  
  if (datos.tipo === 'pelicula' || datos.media_type === 'movie') {
    return { esSerie: false, tipoHistorial: 'pelicula', tipoTMDB: 'movie' };
  }
  
  // Prioridad 2: Verificar propiedades específicas de series
  const propiedadesSerie = [
    datos.name,                    // Título de serie en TMDB
    datos.first_air_date,         // Fecha de primera emisión
    datos.number_of_seasons,      // Número de temporadas
    datos.temporadas,             // Temporadas cargadas
    datos.seasons,                // Seasons en inglés
    datos.episode_run_time,       // Duración de episodios
    datos.created_by,             // Creadores (específico de series)
    datos.networks,               // Cadenas de TV
    datos.in_production,          // En producción (series)
    datos.last_air_date,          // Última fecha de emisión
    datos.next_episode_to_air,    // Próximo episodio
    datos.status && (datos.status.includes('Ended') || datos.status.includes('Returning') || datos.status.includes('Canceled'))
  ];
  
  // Si tiene al menos 2 propiedades de serie, es una serie
  const propiedadesSeriePresentes = propiedadesSerie.filter(prop => prop !== undefined && prop !== null).length;
  
  if (propiedadesSeriePresentes >= 2) {
    return { esSerie: true, tipoHistorial: 'serie', tipoTMDB: 'tv' };
  }
  
  // Prioridad 3: Verificar propiedades específicas de películas
  const propiedadesPelicula = [
    datos.title,                  // Título de película en TMDB
    datos.release_date,           // Fecha de lanzamiento
    datos.runtime,                // Duración en minutos
    datos.budget,                 // Presupuesto
    datos.revenue,                // Recaudación
    datos.production_companies,   // Compañías productoras
    datos.belongs_to_collection   // Pertenece a colección
  ];
  
  const propiedadesPeliculaPresentes = propiedadesPelicula.filter(prop => prop !== undefined && prop !== null).length;
  
  if (propiedadesPeliculaPresentes >= 2) {
    return { esSerie: false, tipoHistorial: 'pelicula', tipoTMDB: 'movie' };
  }
  
  // Por defecto, si no se puede determinar claramente, usar el título para decidir
  // Si tiene 'name' pero no 'title', probablemente es serie
  if (datos.name && !datos.title) {
    return { esSerie: true, tipoHistorial: 'serie', tipoTMDB: 'tv' };
  }
  
  // Si tiene 'title' pero no 'name', probablemente es película
  if (datos.title && !datos.name) {
    return { esSerie: false, tipoHistorial: 'pelicula', tipoTMDB: 'movie' };
  }
  
  // Fallback final: película por defecto
  return { esSerie: false, tipoHistorial: 'pelicula', tipoTMDB: 'movie' };
};