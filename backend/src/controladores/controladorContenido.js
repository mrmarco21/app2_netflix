import modeloContenido from '../modelos/modeloContenido.js';

// Obtener contenido destacado
const obtenerContenidoDestacado = async (req, res) => {
    try {
        const { categoria } = req.query;
        const contenido = await modeloContenido.obtenerContenidoDestacado(categoria);
        
        if (contenido.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró contenido destacado'
            });
        }

        res.status(200).json({
            success: true,
            data: contenido[0] // Retornar solo el primer elemento destacado
        });
    } catch (error) {
        console.error('Error al obtener contenido destacado:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener contenido por categoría
const obtenerContenidoPorCategoria = async (req, res) => {
    try {
        const { categoria } = req.params;
        
        if (!categoria) {
            return res.status(400).json({
                success: false,
                message: 'La categoría es requerida'
            });
        }

        const contenido = await modeloContenido.obtenerContenidoPorCategoria(categoria);
        
        res.status(200).json({
            success: true,
            data: contenido
        });
    } catch (error) {
        console.error('Error al obtener contenido por categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener todas las categorías
const obtenerCategorias = async (req, res) => {
    try {
        const categorias = await modeloContenido.obtenerCategorias();
        
        res.status(200).json({
            success: true,
            data: categorias
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener contenido por tipo (Serie/Película)
const obtenerContenidoPorTipo = async (req, res) => {
    try {
        const { tipo } = req.params;
        
        if (!tipo || !['Serie', 'Película'].includes(tipo)) {
            return res.status(400).json({
                success: false,
                message: 'El tipo debe ser "Serie" o "Película"'
            });
        }

        const contenido = await modeloContenido.obtenerContenidoPorTipo(tipo);
        
        res.status(200).json({
            success: true,
            data: contenido
        });
    } catch (error) {
        console.error('Error al obtener contenido por tipo:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener secciones de contenido organizadas
const obtenerSeccionesContenido = async (req, res) => {
    try {
        const secciones = await modeloContenido.obtenerSeccionesContenido();
        
        res.status(200).json({
            success: true,
            data: secciones
        });
    } catch (error) {
        console.error('Error al obtener secciones de contenido:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
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