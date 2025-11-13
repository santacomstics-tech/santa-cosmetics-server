require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

app.use(cors());
app.use(express.json());

// Ruta raíz
app.get("/", (req, res) => {
  res.send("Servidor de Santa Cosmetics funcionando ✔️");
});

// Transporter correo
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Checkout
app.post("/checkout", async (req, res) => {
  try {
    const { carrito, total, cliente } = req.body;

    const listaProductos = carrito
      .map((p) => `- ${p}`)
      .join("<br>");

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

      <p><strong>Total:</strong> $${total}</p>

      <hr>
      <p>Pedido generado automáticamente.</p>
    `;

    await transporter.sendMail({
      from: `Santa Cosmetics <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: "Nuevo pedido recibido 💄",
      html: emailBody,
    });

    res.json({ success: true, message: "Pedido enviado correctamente" });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
