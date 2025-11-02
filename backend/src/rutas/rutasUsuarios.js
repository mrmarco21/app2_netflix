import express from "express";
import {
  registrarUsuario,
  loginUsuario,
  obtenerUsuarios,
  actualizarCorreo,
  actualizarContrasena,
  eliminarUsuario,
  recuperarContrasenaPorCorreo,
} from "../controladores/controladorUsuario.js";

const router = express.Router();

// Registrar usuario
router.post("/registro", registrarUsuario);

// Login usuario
router.post("/login", loginUsuario);

// Obtener usuarios
router.get("/", obtenerUsuarios);

// Actualizar correo del usuario
router.put("/:id/correo", actualizarCorreo);

// Actualizar contraseña del usuario
router.put("/:id/contrasena", actualizarContrasena);

// Recuperar contraseña por correo (sin contraseña actual)
router.put("/recuperar-contrasena", recuperarContrasenaPorCorreo);

// Eliminar usuario
router.delete("/:id", eliminarUsuario);

export default router;
