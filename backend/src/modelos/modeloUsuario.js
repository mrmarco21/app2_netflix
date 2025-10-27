// Modelo de Usuario para MySQL
// Este archivo define la estructura de datos del usuario
// La tabla se crea automáticamente en basedatos.js

export const usuarioSchema = {
  id: "INT AUTO_INCREMENT PRIMARY KEY",
  nombre: "VARCHAR(100) NOT NULL",
  correo: "VARCHAR(100) NOT NULL UNIQUE",
  password: "VARCHAR(255) NOT NULL",
  fecha_creacion: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
};

// Funciones de validación
export const validarUsuario = (usuario) => {
  const errores = [];

  if (!usuario.nombre || usuario.nombre.trim().length < 2) {
    errores.push("El nombre debe tener al menos 2 caracteres");
  }

  if (!usuario.correo || !validarcorreo(usuario.correo)) {
    errores.push("correo inválido");
  }

  if (!usuario.password || usuario.password.length < 5) {
    errores.push("La contraseña debe tener al menos 5 caracteres");
  }

  return errores;
};

const validarcorreo = (correo) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo);
};

export default {
  usuarioSchema,
  validarUsuario,
};
