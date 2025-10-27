import pool from '../config/basedatos.js';

// Obtener contenido destacado por categoría
const obtenerContenidoDestacado = async (categoria = 'Inicio') => {
    try {
        let query = `
            SELECT * FROM contenido 
            WHERE destacado = 1
        `;
        
        if (categoria !== 'Inicio') {
            query += ` AND categoria = ?`;
            const [rows] = await pool.execute(query, [categoria]);
            return rows;
        }
        
        const [rows] = await pool.execute(query);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Obtener contenido por categoría
const obtenerContenidoPorCategoria = async (categoria) => {
    try {
        const query = `
            SELECT * FROM contenido 
            WHERE categoria = ?
            ORDER BY fecha_agregado DESC
        `;
        const [rows] = await pool.execute(query, [categoria]);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Obtener todas las categorías disponibles
const obtenerCategorias = async () => {
    try {
        const query = `
            SELECT DISTINCT categoria FROM contenido 
            ORDER BY categoria ASC
        `;
        const [rows] = await pool.execute(query);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Obtener contenido por tipo (Serie/Película)
const obtenerContenidoPorTipo = async (tipo) => {
    try {
        const query = `
            SELECT * FROM contenido 
            WHERE tipo = ?
            ORDER BY fecha_agregado DESC
        `;
        const [rows] = await pool.execute(query, [tipo]);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Obtener contenido para secciones específicas
const obtenerSeccionesContenido = async () => {
    try {
        const secciones = [
            {
                titulo: 'Telenovelas sobre venganza dignas de maratón',
                query: `SELECT * FROM contenido WHERE generos LIKE '%Drama%' AND generos LIKE '%Venganza%' LIMIT 10`
            },
            {
                titulo: 'TV asiática de fantasía romántica',
                query: `SELECT * FROM contenido WHERE generos LIKE '%Fantasía%' AND generos LIKE '%Romance%' AND origen = 'Asia' LIMIT 10`
            },
            {
                titulo: 'Aclamados por la crítica',
                query: `SELECT * FROM contenido WHERE puntuacion >= 8.0 ORDER BY puntuacion DESC LIMIT 10`
            },
            {
                titulo: 'Recién agregados',
                query: `SELECT * FROM contenido ORDER BY fecha_agregado DESC LIMIT 10`
            }
        ];

        const resultado = [];
        
        for (const seccion of secciones) {
            const [rows] = await pool.execute(seccion.query);
            resultado.push({
                titulo: seccion.titulo,
                contenidos: rows
            });
        }
        
        return resultado;
    } catch (error) {
        throw error;
    }
};

export {
    obtenerContenidoDestacado,
    obtenerContenidoPorCategoria,
    obtenerCategorias,
    obtenerContenidoPorTipo,
    obtenerSeccionesContenido
};

export default {
    obtenerContenidoDestacado,
    obtenerContenidoPorCategoria,
    obtenerCategorias,
    obtenerContenidoPorTipo,
    obtenerSeccionesContenido
};