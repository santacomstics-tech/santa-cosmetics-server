// ===============================
// Servidor Santa Cosmetics (solo correo)
// ===============================
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = 3000;

// === Variables desde .env ===
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// === Middleware ===
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// === Transporter de correo ===
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// === Ruta principal ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === Ruta de checkout ===
app.post("/checkout", async (req, res) => {
  const { carrito, total, cliente } = req.body;

  console.log("🛍 Pedido recibido de:", cliente?.nombre);
  console.log("📦 Productos:", carrito);
  console.log("💰 Total:", total);

  try {
    const emailBody = `
      <h2>Nuevo pedido recibido</h2>
      <p><strong>Cliente:</strong> ${cliente.nombre}</p>
      <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
      <p><strong>Ciudad:</strong> ${cliente.ciudad}</p>
      <p><strong>Dirección:</strong> ${cliente.direccion}</p>
      <p><strong>Email:</strong> ${cliente.email}</p>
      <hr>
      <h3>Productos:</h3>
      <ul>${carrito.map(p => `<li>${p}</li>`).join("")}</ul>
      <p><strong>Total:</strong> $${total.toLocaleString()}</p>
      <hr>
      <p><em>Este pedido fue enviado automáticamente desde tu sitio web.</em></p>
    `;

    await transporter.sendMail({
      from: `"Santa Cosmetics" <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: "💄 Nuevo pedido recibido",
      html: emailBody,
    });

    console.log("📧 Correo enviado con éxito");
    res.json({ success: true, message: "Pedido procesado y correo enviado correctamente." });

  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// === Iniciar servidor ===
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Santa Cosmetics corriendo en http://localhost:${PORT}`);
});


