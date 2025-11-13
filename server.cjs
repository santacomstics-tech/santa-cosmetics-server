// ===============================
// Servidor Santa Cosmetics
// ===============================
require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// === Variables env ===
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// === Middleware ===
app.use(cors());
app.use(express.json());

// NO SERVIMOS PUBLIC porque Netlify sirve el frontend.
// Render solo maneja el servidor.

// === Transporter (envío de correo) ===
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// === Ruta de prueba ===
app.get("/", (req, res) => {
  res.send("Servidor de Santa Cosmetics funcionando correctamente ✔️");
});

// === Ruta de checkout ===
app.post("/checkout", async (req, res) => {
  try {
    const { carrito, total, cliente } = req.body;

    console.log("🛍 Pedido recibido:", cliente.nombre);
    console.log("📦 Productos:", carrito);

    // Crear lista para el correo
    const listaProductos = carrito
      .map((p) => • ${p})
      .join("<br>");

    // Crear cuerpo del mensaje
    const emailBody = `
      <h2>Nuevo pedido recibido 💄</h2>

      <h3>📌 Datos del cliente</h3>
      <p><strong>Nombre:</strong> ${cliente.nombre}</p>
      <p><strong>Ciudad:</strong> ${cliente.ciudad}</p>
      <p><strong>Dirección:</strong> ${cliente.direccion}</p>
      <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
      <p><strong>Email:</strong> ${cliente.email}</p>

      <hr>

      <h3>🛒 Productos:</h3>
      ${listaProductos}

      <p><strong>Total a pagar:</strong> $${total}</p>

      <hr>
      <p>Este correo fue generado automáticamente desde el servidor.</p>
    `;

    // Enviar correo
    await transporter.sendMail({
      from: Santa Cosmetics <${EMAIL_USER}>,
      to: EMAIL_USER,
      subject: "Nuevo pedido recibido 💄",
      html: emailBody,
    });

    console.log("📧 Correo enviado correctamente");

    res.json({
      success: true,
      message: "Pedido enviado y correo enviado exitosamente",
    });

  } catch (err) {
    console.error("❌ Error en checkout:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// === Iniciar servidor ===
app.listen(PORT, () => {
  console.log(🚀 Servidor corriendo en puerto ${PORT});
});og("🚀 Servidor funcionando en puerto " + PORT);
});