import express from 'express';
import * as controladorPerfil from '../controladores/controladorPerfil.js';

const router = express.Router();

// Crear un nuevo perfil
router.post('/', controladorPerfil.crearPerfil);

// Obtener todos los perfiles de un usuario
router.get('/usuario/:id_usuario', controladorPerfil.obtenerPerfilesPorUsuario);

// Actualizar un perfil
router.put('/:id', controladorPerfil.actualizarPerfil);

// Actualizar PIN de un perfil
router.put('/:id/pin', controladorPerfil.actualizarPinPerfil);

// Verificar PIN de un perfil
router.post('/:id/verificar-pin', controladorPerfil.verificarPinPerfil);

// Eliminar un perfil
router.delete('/:id', controladorPerfil.eliminarPerfil);

export default router;