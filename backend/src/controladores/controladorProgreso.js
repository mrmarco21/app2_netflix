import modeloProgreso from '../modelos/modeloProgreso.js';

// Obtener progreso de visualización por perfil
const obtenerProgresoPorPerfil = async (req, res) => {
    try {
        const { idPerfil } = req.params;
        
        if (!idPerfil) {
            return res.status(400).json({
                success: false,
                message: 'El ID del perfil es requerido'
            });
        }

        const progreso = await modeloProgreso.obtenerProgresoPorPerfil(idPerfil);
        
        res.status(200).json({
            success: true,
            data: progreso
        });
    } catch (error) {
        console.error('Error al obtener progreso por perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Actualizar progreso de visualización
const actualizarProgreso = async (req, res) => {
    try {
        const { idPerfil, idContenido, tiempoSegundos } = req.body;
        
        // Validaciones
        if (!idPerfil || !idContenido || tiempoSegundos === undefined) {
            return res.status(400).json({
                success: false,
                message: 'ID del perfil, ID del contenido y tiempo en segundos son requeridos'
            });
        }

        if (tiempoSegundos < 0) {
            return res.status(400).json({
                success: false,
                message: 'El tiempo en segundos debe ser mayor o igual a 0'
            });
        }

        const resultado = await modeloProgreso.actualizarProgreso(idPerfil, idContenido, tiempoSegundos);
        
        res.status(200).json({
            success: true,
            message: 'Progreso actualizado correctamente',
            data: resultado
        });
    } catch (error) {
        console.error('Error al actualizar progreso:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Eliminar progreso de visualización
const eliminarProgreso = async (req, res) => {
    try {
        const { idPerfil, idContenido } = req.params;
        
        if (!idPerfil || !idContenido) {
            return res.status(400).json({
                success: false,
                message: 'ID del perfil e ID del contenido son requeridos'
            });
        }

        const resultado = await modeloProgreso.eliminarProgreso(idPerfil, idContenido);
        
        res.status(200).json({
            success: true,
            message: 'Progreso eliminado correctamente',
            data: resultado
        });
    } catch (error) {
        console.error('Error al eliminar progreso:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener contenido para continuar viendo
const obtenerContinuarViendo = async (req, res) => {
    try {
        const { idPerfil } = req.params;
        
        if (!idPerfil) {
            return res.status(400).json({
                success: false,
                message: 'El ID del perfil es requerido'
            });
        }

        const contenido = await modeloProgreso.obtenerContinuarViendo(idPerfil);
        
        res.status(200).json({
            success: true,
            data: contenido
        });
    } catch (error) {
        console.error('Error al obtener contenido para continuar viendo:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
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