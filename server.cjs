// ===============================
// Servidor Santa Cosmetics (versión 100 % funcional con Bloc de notas)
// ===============================
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = 3000;

// === Variables desde .env ===
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const ENVIA_API_KEY = process.env.ENVIA_API_KEY;

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
  res.sendFile(path.join(__dirname, "public", "productos.html"));
});

// === Ruta de checkout ===
app.post("/checkout", async (req, res) => {
  const { carrito, total, cliente } = req.body;

  console.log("🛍 Pedido recibido de:", cliente?.nombre);
  console.log("📦 Productos:", carrito);
  console.log("💰 Total:", total);

  try {
    // === Crear envío de prueba en Envía ===
    const envioBody = {
      origin: {
        name: "Santa Cosmetics",
        company: "Santa Cosmetics",
        email: EMAIL_USER,
        phone: "3000000000",
        street: "Calle Falsa 123",
        number: "123",
        district: "Centro",
        city: "Bogotá",
        state: "Cundinamarca",
        country: "CO",
        postalCode: "110111",
      },
      destination: {
        name: cliente.nombre,
        company: "N/A",
        email: cliente.email,
        phone: cliente.telefono,
        street: cliente.direccion,
        number: "0",
        district: "Barrio X",
        city: cliente.ciudad,
        state: "Cundinamarca",
        country: "CO",
        postalCode: "110111",
      },
      packages: [
        {
          content: "Productos Santa Cosmetics",
          amount: 1,
          type: "box",
          weight: 1,
          insurance: 0,
          declaredValue: total,
          length: 20,
          width: 20,
          height: 10,
        },
      ],
      shipment: {
        carrier: "ENVIA",
        type: 1,
      },
      settings: {
        printFormat: "PDF",
        printSize: "STOCK_4X6",
        currency: "COP",
        cashOnDelivery: false,
      },
    };

    const enviaResponse = await fetch("https://api-test.envia.com/ship/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENVIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(envioBody),
    });

    const resultText = await enviaResponse.text();
    console.log("📦 Respuesta cruda de Envía:", resultText);

    let result;
    try {
      result = JSON.parse(resultText);
    } catch {
      result = { error: "Respuesta inválida de Envía", raw: resultText };
    }

    // === Crear cuerpo del correo ===
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
      <p>Se ha generado el envío (modo prueba).</p>
    `;

    // === Enviar correo ===
    await transporter.sendMail({
      from: `Santa Cosmetics <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: `💄 Nuevo pedido de ${cliente.nombre}`,
      html: emailBody,
    });

    console.log("📧 Correo enviado con éxito");
    res.json({ success: true, message: "Pedido procesado y correo enviado correctamente." });

  } catch (error) {
    console.error("❌ Error en checkout:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// === Iniciar servidor ===
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Santa Cosmetics corriendo en http://localhost:${PORT}`);
});
