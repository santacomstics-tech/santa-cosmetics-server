// -----------------------------
// Santa Cosmetics - Servidor
// -----------------------------

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 10000;

// -----------------------------
// Middlewares
// -----------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// Transporter para correo
// -----------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,  // TU CORREO
    pass: process.env.EMAIL_PASS   // CONTRASEÑA O APP PASSWORD
  }
});

// -----------------------------
// Ruta de prueba
// -----------------------------
app.get("/", (req, res) => {
  res.json({ message: "Servidor activo Santa Cosmetics" });
});

// -----------------------------
// Checkout - ENVÍO DE CORREO
// -----------------------------
app.post("/checkout", async (req, res) => {
  try {
    const { carrito, total } = req.body;

    if (!carrito || !Array.isArray(carrito)) {
      return res.status(400).json({ success: false, message: "Carrito inválido" });
    }

    const htmlLista = carrito.map(item => `<li>${item}</li>`).join("");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Nueva compra - Santa Cosmetics",
      html: `
        <h2>Nuevo Pedido</h2>
        <p><b>Total:</b> $${total.toLocaleString()}</p>
        <p><b>Carrito:</b></p>
        <ul>${htmlLista}</ul>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "Correo enviado correctamente" });

  } catch (err) {
    console.error("Error en checkout:", err);
    return res.status(500).json({ success: false, message: "Error al enviar correo" });
  }
});

// -----------------------------
// Iniciar servidor
// -----------------------------
app.listen(PORT, () => {
  console.log(`Servidor funcionando en puerto ${PORT}`);
});
