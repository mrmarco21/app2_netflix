import pool from "../config/basedatos.js";
import bcrypt from "bcrypt"

// Registrar usuario
export const registrarUsuario = async (req, res) => {
  const { nombres, correo, contrasena } = req.body;

  try {
    // Verificar si el usuario ya existe
    const [resultado] = await pool.execute("SELECT * FROM usuarios WHERE correo = ?", [correo]);

    if (resultado.length > 0) {
      return res.status(400).json({
        success: false,
        mensaje: "El usuario ya existe con este correo"
      });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

    // Crear nuevo usuario
    const [resultadoInsertar] = await pool.execute(
      "INSERT INTO usuarios (nombres, correo, contrasena) VALUES (?, ?, ?)",
      [nombres, correo, contrasenaEncriptada]
    );

    res.status(201).json({
      success: true,
      mensaje: "Usuario registrado exitosamente",
      usuario: {
        id: resultadoInsertar.insertId,
        nombres,
        correo: correo
      }
    });
  } catch (err) {
    console.error("Error al registrar usuario:", err);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor",
      error: err.message
    });
  }
};

// Login usuario
export const loginUsuario = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    // Buscar usuario por correo
    const [usuarioExiste] = await pool.execute(
      "SELECT id, nombres, correo, contrasena FROM usuarios WHERE correo = ?", 
      [correo]
    );

    if (usuarioExiste.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "El usuario no existe. Por favor, verifica el correo o regístrate."
      });
    }

    const usuario = usuarioExiste[0];

    // Comparar la contraseña ingresada con la encriptada
    const coincide = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!coincide) {
      return res.status(401).json({
        success: false,
        mensaje: "Contraseña incorrecta. Inténtalo nuevamente."
      });
    }

    // Si todo está correcto
    res.status(200).json({
      success: true,
      mensaje: "Inicio de sesión exitoso",
      usuario: {
        id: usuario.id,
        nombres: usuario.nombres,
        correo: usuario.correo
      }
    });

  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor",
      error: err.message
    });
  }
};

// Obtener todos los usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const [resultado] = await pool.execute("SELECT id, nombres, correo FROM usuarios");

    res.status(200).json({
      success: true,
      usuarios: resultado
    });
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor",
      error: err.message
    });
  }
};
