import express from 'express';
import controladorContenido from '../controladores/controladorContenido.js';

const router = express.Router();

// Ruta para obtener contenido destacado
// GET /contenido/destacado?categoria=Serie
router.get('/destacado', controladorContenido.obtenerContenidoDestacado);

// Ruta para obtener contenido por categoría específica
// GET /contenido/categoria/Acción
router.get('/categoria/:categoria', controladorContenido.obtenerContenidoPorCategoria);

// Ruta para obtener todas las categorías disponibles
// GET /contenido/categorias
router.get('/categorias', controladorContenido.obtenerCategorias);

// Ruta para obtener contenido por tipo (Serie/Película)
// GET /contenido/tipo/Serie
router.get('/tipo/:tipo', controladorContenido.obtenerContenidoPorTipo);

// Ruta para obtener secciones de contenido organizadas
// GET /contenido/secciones
router.get('/secciones', controladorContenido.obtenerSeccionesContenido);

export default router;