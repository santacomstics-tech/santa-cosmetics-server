// ===============================
// Servidor Santa Cosmetics (FINAL)
// ===============================

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// === Variables desde Render ===
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// === Middlewares ===
app.use(cors());
app.use(bodyParser.json());

// === Transporter de correo ===
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// === Ruta raíz ===
app.get("/", (req, res) => {
  res.send("Servidor de Santa Cosmetics funcionando correctamente.");
});

// === Ruta de checkout ===
app.post("/checkout", async (req, res) => {
  try {
    const { carrito, total, cliente } = req.body;

    console.log("🛍 Pedido recibido:");
    console.log("Cliente:", cliente);
    console.log("Productos:", carrito);
    console.log("Total:", total);

    // Convertir productos a HTML seguro
    const listaProductos = carrito
      .map((p) => "• " + p)
      .join("<br>");

    // === Enviar correo ===
    const emailBody = `
      <h2>Nuevo pedido recibido</h2>
      <p><strong>Cliente:</strong> ${cliente.nombre}</p>
      <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
      <p><strong>Ciudad:</strong> ${cliente.ciudad}</p>
      <p><strong>Dirección:</strong> ${cliente.direccion}</p>
      <p><strong>Email:</strong> ${cliente.email}</p>
      <hr>
      <h3>Productos:</h3>
      <p>${listaProductos}</p>
      <p><strong>Total:</strong> $${total}</p>
      <p>📦 El envío será gestionado manualmente por Santa Cosmetics.</p>
    `;

    await transporter.sendMail({
      from: Santa Cosmetics <${EMAIL_USER}>,
      to: EMAIL_USER,
      subject: "Nuevo pedido recibido 💄",
      html: emailBody,
    });

    console.log("📧 Correo enviado con éxito");

    return res.json({ success: true, message: "Pedido enviado y correo enviado." });

  } catch (error) {
    console.error("❌ Error en /checkout:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// === Iniciar servidor ===
app.listen(PORT, () => {
  console.log("🚀 Servidor funcionando en puerto " + PORT);
});