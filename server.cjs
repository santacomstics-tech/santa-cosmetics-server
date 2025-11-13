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

// === Middleware ===
app.use(cors());
app.use(bodyParser.json());

// === Variables de entorno ===
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// === Transporter ===
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// === Ruta test ===
app.get("/", (req, res) => {
  res.send("Servidor Santa Cosmetics funcionando ✔");
});

// === Checkout ===
app.post("/checkout", async (req, res) => {
  const { carrito, total, cliente } = req.body;

  console.log("🛍 Pedido recibido");
  console.log("Cliente:", cliente);
  console.log("Productos:", carrito);
  console.log("Total:", total);

  try {
    // Construir lista de productos seguro para Node
    const listaProductos = carrito
      .map(p => • ${p})
      .join("<br>");

    const emailHTML = `
      <h2>Nuevo pedido recibido</h2>

      <h3>Cliente</h3>
      <p><strong>Nombre:</strong> ${cliente.nombre}</p>
      <p><strong>Ciudad:</strong> ${cliente.ciudad}</p>
      <p><strong>Dirección:</strong> ${cliente.direccion}</p>
      <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
      <p><strong>Email:</strong> ${cliente.email}</p>

      <hr>

      <h3>Productos</h3>
      <p>${listaProductos}</p>

      <h3>Total: $${total.toLocaleString()}</h3>

      <hr>
      <p>El envío será gestionado por el vendedor manualmente.</p>
    `;

    await transporter.sendMail({
      from: Santa Cosmetics <${EMAIL_USER}>,
      to: EMAIL_USER,
      subject: "Nuevo pedido recibido 💄",
      html: emailHTML,
    });

    console.log("📧 Correo enviado");
    res.json({ success: true });

  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// === Start server ===
app.listen(PORT, () => {
  console.log(🚀 Servidor de Santa Cosmetics corriendo en http://localhost:${PORT});
});