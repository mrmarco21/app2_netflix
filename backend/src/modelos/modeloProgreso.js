import pool from '../config/basedatos.js';

// Obtener progreso de visualización por perfil
const obtenerProgresoPorPerfil = async (idPerfil) => {
    try {
        const query = `
            SELECT p.*, c.titulo, c.imagen, c.tipo, c.generos
            FROM progreso p
            INNER JOIN contenido c ON p.id_contenido = c.id
            WHERE p.id_perfil = ?
            ORDER BY p.fecha_actualizacion DESC
        `;
        const [rows] = await pool.execute(query, [idPerfil]);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Crear o actualizar progreso de visualización
const actualizarProgreso = async (idPerfil, idContenido, tiempoSegundos) => {
    try {
        // Verificar si ya existe un registro de progreso
        const queryExiste = `
            SELECT id FROM progreso 
            WHERE id_perfil = ? AND id_contenido = ?
        `;
        const [existe] = await pool.execute(queryExiste, [idPerfil, idContenido]);

        if (existe.length > 0) {
            // Actualizar progreso existente
            const queryActualizar = `
                UPDATE progreso 
                SET tiempo_segundos = ?, fecha_actualizacion = NOW()
                WHERE id_perfil = ? AND id_contenido = ?
            `;
            await pool.execute(queryActualizar, [tiempoSegundos, idPerfil, idContenido]);
        } else {
            // Crear nuevo registro de progreso
            const queryCrear = `
                INSERT INTO progreso (id_perfil, id_contenido, tiempo_segundos, fecha_actualizacion)
                VALUES (?, ?, ?, NOW())
            `;
            await pool.execute(queryCrear, [idPerfil, idContenido, tiempoSegundos]);
        }

        return { success: true };
    } catch (error) {
        throw error;
    }
};

// Eliminar progreso de visualización
const eliminarProgreso = async (idPerfil, idContenido) => {
    try {
        const query = `
            DELETE FROM progreso 
            WHERE id_perfil = ? AND id_contenido = ?
        `;
        await pool.execute(query, [idPerfil, idContenido]);
        return { success: true };
    } catch (error) {
        throw error;
    }
};

// Obtener contenido para continuar viendo (con progreso > 0 y < 90%)
const obtenerContinuarViendo = async (idPerfil) => {
    try {
        const query = `
            SELECT 
                p.*,
                c.titulo,
                c.imagen,
                c.tipo,
                c.duracion_minutos,
                c.generos,
                ROUND((p.tiempo_segundos / (c.duracion_minutos * 60)) * 100, 2) as porcentaje_visto
            FROM progreso p
            INNER JOIN contenido c ON p.id_contenido = c.id
            WHERE p.id_perfil = ? 
            AND p.tiempo_segundos > 0 
            AND (p.tiempo_segundos / (c.duracion_minutos * 60)) < 0.9
            ORDER BY p.fecha_actualizacion DESC
            LIMIT 10
        `;
        const [rows] = await pool.execute(query, [idPerfil]);
        return rows;
    } catch (error) {
        throw error;
    }
};

export {
    obtenerProgresoPorPerfil,
    actualizarProgreso,
    eliminarProgreso,
    obtenerContinuarViendo
};

export default {
    obtenerProgresoPorPerfil,
    actualizarProgreso,
    eliminarProgreso,
    obtenerContinuarViendo
};