import express from 'express';
import controladorProgreso from '../controladores/controladorProgreso.js';

const router = express.Router();

// Ruta para obtener progreso de visualización por perfil
// GET /progreso/perfil/1
router.get('/perfil/:idPerfil', controladorProgreso.obtenerProgresoPorPerfil);

// Ruta para actualizar progreso de visualización
// POST /progreso/actualizar
router.post('/actualizar', controladorProgreso.actualizarProgreso);

// Ruta para eliminar progreso de visualización
// DELETE /progreso/perfil/1/contenido/123
router.delete('/perfil/:idPerfil/contenido/:idContenido', controladorProgreso.eliminarProgreso);

// Ruta para obtener contenido para continuar viendo
// GET /progreso/continuar-viendo/1
router.get('/continuar-viendo/:idPerfil', controladorProgreso.obtenerContinuarViendo);

// Mantener compatibilidad con rutas anteriores
// Guardar o actualizar progreso (ruta legacy)
router.post("/guardar", controladorProgreso.actualizarProgreso);

// Obtener progreso (ruta legacy)
router.get("/:id_perfil/:id_contenido", async (req, res) => {
  try {
    const { id_perfil, id_contenido } = req.params;
    // Redirigir a la nueva función del controlador
    req.params.idPerfil = id_perfil;
    await controladorProgreso.obtenerProgresoPorPerfil(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
