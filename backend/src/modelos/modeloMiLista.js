import pool from "../config/basedatos.js";

// Obtener la lista personal de un perfil
export const obtenerMiLista = async (id_perfil) => {
  try {
    console.log('🔍 Ejecutando consulta para perfil:', id_perfil);
    
    const [lista] = await pool.execute(
      "SELECT * FROM mi_lista WHERE id_perfil = ? ORDER BY fecha_agregado DESC",
      [id_perfil]
    );
    
    console.log('📊 Consulta ejecutada, resultados:', lista.length);
    return lista;
  } catch (error) {
    console.error("❌ Error en modelo obtenerMiLista:", error);
    console.error("Código de error:", error.code);
    console.error("SQL State:", error.sqlState);
    throw error;
  }
};

// Agregar contenido a Mi Lista
export const agregarAMiLista = async (id_perfil, id_contenido, titulo, imagen, tipo) => {
  try {
    const [resultado] = await pool.execute(
      "INSERT INTO mi_lista (id_perfil, id_contenido, titulo, imagen, tipo) VALUES (?, ?, ?, ?, ?)",
      [id_perfil, id_contenido, titulo, imagen, tipo]
    );
    return resultado;
  } catch (error) {
    // Si es un error de duplicado, lo manejamos específicamente
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('El contenido ya está en Mi Lista');
    }
    console.error("Error al agregar a Mi Lista:", error);
    throw error;
  }
};

// Quitar contenido de Mi Lista
export const quitarDeMiLista = async (id_perfil, id_contenido) => {
  try {
    const [resultado] = await pool.execute(
      "DELETE FROM mi_lista WHERE id_perfil = ? AND id_contenido = ?",
      [id_perfil, id_contenido]
    );
    return resultado;
  } catch (error) {
    console.error("Error al quitar de Mi Lista:", error);
    throw error;
  }
};

// Verificar si un contenido está en Mi Lista
export const verificarEnMiLista = async (id_perfil, id_contenido) => {
  try {
    const [resultado] = await pool.execute(
      "SELECT COUNT(*) as existe FROM mi_lista WHERE id_perfil = ? AND id_contenido = ?",
      [id_perfil, id_contenido]
    );
    return resultado[0].existe > 0;
  } catch (error) {
    console.error("Error al verificar en Mi Lista:", error);
    throw error;
  }
};

// Obtener un elemento específico de Mi Lista
export const obtenerElementoMiLista = async (id_perfil, id_contenido) => {
  try {
    const [elementos] = await pool.execute(
      "SELECT * FROM mi_lista WHERE id_perfil = ? AND id_contenido = ?",
      [id_perfil, id_contenido]
    );
    return elementos[0];
  } catch (error) {
    console.error("Error al obtener elemento de Mi Lista:", error);
    throw error;
  }
};

// Actualizar un elemento específico de Mi Lista
export const actualizarElementoMiLista = async (id, datosActualizacion) => {
  try {
    const campos = [];
    const valores = [];
    
    // Construir dinámicamente la consulta SQL
    if (datosActualizacion.tipo !== undefined) {
      campos.push("tipo = ?");
      valores.push(datosActualizacion.tipo);
    }
    
    if (datosActualizacion.id_contenido !== undefined) {
      campos.push("id_contenido = ?");
      valores.push(datosActualizacion.id_contenido);
    }
    
    if (datosActualizacion.titulo !== undefined) {
      campos.push("titulo = ?");
      valores.push(datosActualizacion.titulo);
    }
    
    if (datosActualizacion.imagen !== undefined) {
      campos.push("imagen = ?");
      valores.push(datosActualizacion.imagen);
    }
    
    if (campos.length === 0) {
      throw new Error("No hay campos para actualizar");
    }
    
    valores.push(id);
    
    const [resultado] = await pool.execute(
      `UPDATE mi_lista SET ${campos.join(", ")} WHERE id = ?`,
      valores
    );
    
    return resultado;
  } catch (error) {
    console.error("Error al actualizar elemento de Mi Lista:", error);
    throw error;
  }
};