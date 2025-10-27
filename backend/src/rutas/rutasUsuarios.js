import express from "express";
import {
  registrarUsuario,
  loginUsuario,
  obtenerUsuarios,
} from "../controladores/controladorUsuario.js";

const router = express.Router();

// Registrar usuario
router.post("/registro", registrarUsuario);

// Login usuario
router.post("/login", loginUsuario);

// Obtener usuarios
router.get("/", obtenerUsuarios);

export default router;
