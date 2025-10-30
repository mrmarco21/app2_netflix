const BASE_URL = 'http://192.168.18.31:3000';

// Obtener Mi Lista de un perfil
export const obtenerMiLista = async (idPerfil) => {
  try {
    const response = await fetch(`${BASE_URL}/mi-lista/perfil/${idPerfil}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al obtener Mi Lista');
    }
    
    return data.lista;
  } catch (error) {
    console.error('Error al obtener Mi Lista:', error);
    throw error;
  }
};

// Agregar contenido a Mi Lista
export const agregarAMiLista = async (idPerfil, contenido) => {
  try {
    // Función mejorada para detectar el tipo de contenido
    const detectarTipo = (item) => {
      console.log('🔍 Detectando tipo de contenido para:', item);
      
      // 1. Si ya tiene tipo explícito, usarlo
      if (item.tipo === 'serie' || item.tipo === 'pelicula') {
        console.log('✅ Tipo explícito encontrado:', item.tipo);
        return item.tipo;
      }
      
      // 2. Verificar media_type de TMDB
      if (item.media_type === 'tv') {
        console.log('✅ Detectado como serie por media_type: tv');
        return 'serie';
      }
      
      if (item.media_type === 'movie') {
        console.log('✅ Detectado como película por media_type: movie');
        return 'pelicula';
      }
      
      // 3. Verificar propiedades específicas de series
      const propiedadesSerie = [
        item.name,                    // Series usan 'name' en lugar de 'title'
        item.first_air_date,          // Series tienen fecha de primera emisión
        item.number_of_seasons,       // Series tienen temporadas
        item.number_of_episodes,      // Series tienen episodios
        item.seasons,                 // Array de temporadas
        item.temporadas,              // Array de temporadas en español
        item.episode_run_time,        // Duración de episodios
        item.created_by,              // Series tienen creadores
        item.networks,                // Series tienen cadenas de TV
        item.in_production,           // Series pueden estar en producción
        item.last_air_date,           // Fecha del último episodio
        item.next_episode_to_air,     // Próximo episodio
        item.status && ['Returning Series', 'In Production', 'Ended', 'Canceled'].includes(item.status)
      ];
      
      const esSerie = propiedadesSerie.some(prop => prop !== undefined && prop !== null);
      
      // 4. Verificar propiedades específicas de películas
      const propiedadesPelicula = [
        item.title,                   // Películas usan 'title'
        item.release_date,            // Películas tienen fecha de estreno
        item.runtime,                 // Películas tienen duración total
        item.budget,                  // Películas tienen presupuesto
        item.revenue,                 // Películas tienen ingresos
        item.imdb_id,                 // ID de IMDB (más común en películas)
        item.belongs_to_collection,   // Pertenece a una colección de películas
        item.production_companies,    // Compañías productoras
        item.status && ['Released', 'Post Production', 'In Production'].includes(item.status)
      ];
      
      const esPelicula = propiedadesPelicula.some(prop => prop !== undefined && prop !== null);
      
      // 5. Lógica de decisión
      if (esSerie && !esPelicula) {
        console.log('✅ Detectado como serie por propiedades específicas');
        return 'serie';
      }
      
      if (esPelicula && !esSerie) {
        console.log('✅ Detectado como película por propiedades específicas');
        return 'pelicula';
      }
      
      // 6. Si ambos o ninguno, usar heurísticas adicionales
      if (item.name && !item.title) {
        console.log('✅ Detectado como serie (tiene name pero no title)');
        return 'serie';
      }
      
      if (item.title && !item.name) {
        console.log('✅ Detectado como película (tiene title pero no name)');
        return 'pelicula';
      }
      
      // 7. Verificar fechas
      if (item.first_air_date && !item.release_date) {
        console.log('✅ Detectado como serie (tiene first_air_date pero no release_date)');
        return 'serie';
      }
      
      if (item.release_date && !item.first_air_date) {
        console.log('✅ Detectado como película (tiene release_date pero no first_air_date)');
        return 'pelicula';
      }
      
      // 8. Por defecto, asumir película si no se puede determinar
      console.log('⚠️ No se pudo determinar el tipo, asumiendo película por defecto');
      return 'pelicula';
    };

    const tipoDetectado = detectarTipo(contenido);
    
    const response = await fetch(`${BASE_URL}/mi-lista/agregar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_perfil: idPerfil,
        id_contenido: contenido.id.toString(),
        titulo: contenido.titulo || contenido.title || contenido.name,
        imagen: contenido.imagen || contenido.poster_url || contenido.poster_small,
        tipo: tipoDetectado
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al agregar a Mi Lista');
    }
    
    return data;
  } catch (error) {
    console.error('Error al agregar a Mi Lista:', error);
    throw error;
  }
};

// Quitar contenido de Mi Lista
export const quitarDeMiLista = async (idPerfil, idContenido) => {
  try {
    const response = await fetch(`${BASE_URL}/mi-lista/quitar/${idPerfil}/${idContenido}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al quitar de Mi Lista');
    }
    
    return data;
  } catch (error) {
    console.error('Error al quitar de Mi Lista:', error);
    throw error;
  }
};

// Verificar si un contenido está en Mi Lista
export const verificarEnMiLista = async (idPerfil, idContenido) => {
  try {
    const response = await fetch(`${BASE_URL}/mi-lista/verificar/${idPerfil}/${idContenido}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al verificar en Mi Lista');
    }
    
    return data.enMiLista;
  } catch (error) {
    console.error('Error al verificar en Mi Lista:', error);
    return false;
  }
};