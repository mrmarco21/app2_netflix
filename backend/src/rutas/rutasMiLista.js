import express from 'express';
import * as controladorMiLista from '../controladores/controladorMiLista.js';

const router = express.Router();

// Obtener la lista personal de un perfil
router.get('/perfil/:id_perfil', controladorMiLista.obtenerMiLista);

// Agregar contenido a Mi Lista
router.post('/agregar', controladorMiLista.agregarAMiLista);

// Actualizar un elemento específico de Mi Lista
router.put('/:id', controladorMiLista.actualizarElementoMiLista);

// Quitar contenido de Mi Lista
router.delete('/quitar/:id_perfil/:id_contenido', controladorMiLista.quitarDeMiLista);

// Verificar si un contenido está en Mi Lista
router.get('/verificar/:id_perfil/:id_contenido', controladorMiLista.verificarEnMiLista);

export default router;