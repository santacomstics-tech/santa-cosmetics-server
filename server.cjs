// ===============================
// Servidor Santa Cosmetics
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
const EMAIL_USER = "santacomstics@gmail.com";
const EMAIL_PASS = "lprdklcqwgzotcoe";
const ENVIA_API_KEY = "8f540de66376545ee63b0276689a0da92dd02e1847cdb576c28d824cff537cb0";

// === Middleware ===
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// === Transporter de correo ===
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// === Ruta principal ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === Ruta de checkout ===
app.post("/checkout", async (req, res) => {
  try {
    const { carrito, total } = req.body;
    console.log("🛍 Pedido recibido:");
    console.log(carrito);
    console.log("💰 Total:", total);

    if (!carrito || !Array.isArray(carrito)) {
      console.error("❌ Carrito vacío o inválido:", carrito);
      return res.status(400).json({ success: false, message: "Carrito inválido" });
    }

    // Simular proceso de pago exitoso
    console.log("💳 Pago simulado correctamente");

    // Enviar correo de confirmación
    const emailBody = `
      <h2>Nuevo pedido recibido</h2>
      <p><strong>Productos:</strong></p>
      <ul>${carrito.map(p => <li>${p}</li>).join("")}</ul>
      <p><strong>Total:</strong> $${total}</p>
    `;

    await transporter.sendMail({
      from: "Santa Cosmetics" <${EMAIL_USER}>,
      to: EMAIL_USER,
      subject: "Nuevo pedido recibido 💄",
      html: emailBody
    });

    console.log("📧 Correo enviado con éxito");
    res.json({ success: true, message: "Pedido recibido y correo enviado" });

  } catch (error) {
    console.error("❌ Error en checkout:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

  // Paso 1: Espacio para integrar Wompi
  console.log("💳 (Espacio reservado para integración con Wompi)");

  // Paso 2: Crear envío con Envía
  try {
    const enviaResponse = await fetch("https://api-test.envia.com/ship/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ENVIA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        origin: {
          name: "Santa Cosmetics",
          company: "Santa Cosmetics",
          email: EMAIL_USER,
          phone: "3000000000",
          street: "Calle falsa 123",
          number: "123",
          district: "Centro",
          city: "Bogota",
          state: "Cundinamarca",
          country: "CO",
          postalCode: "110111"
        },
        destination: {
          name: "Cliente Santa Cosmetics",
          company: "N/A",
          email: "cliente@correo.com",
          phone: "3000000000",
          street: "Direccion cliente",
          number: "45",
          district: "Barrio X",
          city: "Bogota",
          state: "Cundinamarca",
          country: "CO",
          postalCode: "110111"
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
            height: 10
          }
        ],
        shipment: {
          carrier: "ENVIA",
          type: 1
        },
        settings: { // ✅ requerido por la API
          printFormat: "PDF",
          printSize: "STOCK_4X6",
          comments: "Pedido generado desde Santa Cosmetics"
        }
      })
    });

    const result = await enviaResponse.json();
    console.log("📦 Respuesta de Envía:", result);

    // Paso 3: Enviar correo de confirmación
    const emailBody =
  "<h2>Nuevo pedido recibido</h2>" +
  "<p><strong>Productos:</strong></p>" +
  "<p><strong>Total:</strong> $" + total + "</p>" +
  "<p>Se ha generado el envío con Envía.</p>";

    await transporter.sendMail({
      from: `Santa Cosmetics <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: "Nuevo pedido recibido 💄",
      html: emailBody
    });

    console.log("📧 Correo enviado con éxito");
    res.json({ success: true, message: "Pedido procesado y correo enviado." });

  } catch (error) {
    console.error("❌ Error en checkout:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// === Iniciar servidor ===
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Santa Cosmetics corriendo en http://localhost:${PORT}`);
});