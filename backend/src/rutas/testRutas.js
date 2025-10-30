import express from "express";

console.log("🧪 Cargando módulo testRutas.js...");

const router = express.Router();

router.get("/test", (req, res) => {
  console.log("🧪 Ruta de prueba llamada");
  res.json({ message: "Ruta de prueba funcionando" });
});

console.log("🧪 Rutas de prueba registradas");

export default router;