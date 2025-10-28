import express from 'express';
import * as controladorCalificaciones from '../controladores/controladorCalificaciones.js';

const router = express.Router();

// Obtener todas las calificaciones de un perfil
router.get('/perfil/:id_perfil', controladorCalificaciones.obtenerCalificacionesPorPerfil);

// Obtener calificación específica de un contenido por perfil
router.get('/perfil/:id_perfil/contenido/:id_contenido', controladorCalificaciones.obtenerCalificacion);

// Crear o actualizar una calificación
router.post('/calificar', controladorCalificaciones.calificarContenido);

// Eliminar una calificación
router.delete('/eliminar/:id_perfil/:id_contenido', controladorCalificaciones.eliminarCalificacion);

export default router;