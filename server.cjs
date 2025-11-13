// ===============================
// Servidor Santa Cosmetics
// ===============================
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Variables de entorno
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Transporter para correo
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🚀 Servidor Santa Cosmetics funcionando correctamente");
});

// Ruta de checkout (solo correo)
app.post("/checkout", async (req, res) => {
  const { carrito, total, cliente } = req.body;

  console.log("🛍 Pedido recibido de:", cliente?.nombre);
  console.log("📦 Productos:", carrito);
  console.log("💰 Total:", total);

  try {
    const listaProductos = carrito
      .map(p => <li>${p}</li>)
      .join("");

    const emailBody = `
      <h2>Nuevo pedido recibido</h2>

      <h3>Datos del Cliente</h3>
      <p><strong>Nombre:</strong> ${cliente.nombre}</p>
      <p><strong>Ciudad:</strong> ${cliente.ciudad}</p>
      <p><strong>Dirección:</strong> ${cliente.direccion}</p>
      <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
      <p><strong>Correo:</strong> ${cliente.email}</p>

      <hr>

      <h3>Productos:</h3>
      <ul>${listaProductos}</ul>

      <p><strong>Total:</strong> $${total}</p>
      <hr>
      <p>Este correo fue generado automáticamente desde Santa Cosmetics.</p>
    `;

    await transporter.sendMail({
      from: "Santa Cosmetics" <${EMAIL_USER}>,
      to: EMAIL_USER,
      subject: "Nuevo pedido recibido 💄",
      html: emailBody,
    });

    console.log("📧 Correo enviado correctamente");
    res.json({ success: true, message: "Correo enviado correctamente" });

  } catch (error) {
    console.error("❌ Error en checkout:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(🚀 Servidor Santa Cosmetics corriendo en puerto ${PORT});
});