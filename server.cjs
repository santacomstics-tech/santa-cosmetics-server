// ===============================
// Servidor Santa Cosmetics (Render)
// ===============================
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// === Variables desde .env ===
const EMAIL_USER = process.env.EMAIL_USER || "santacomstics@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "lprdklcqwgzotcoe";
const ENVIA_API_KEY = process.env.ENVIA_API_KEY || "8f540de66376545ee63b0276689a0da92dd02e1847cdb576c28d824cff537cb0";

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

// === Ruta productos.html ===
app.get("/productos", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "productos.html"));
});

// === Ruta de checkout ===
app.post("/checkout", async (req, res) => {
  try {
    const { carrito, total, datosEnvio } = req.body;

    console.log("🛍 Pedido recibido:", carrito);
    console.log("💰 Total:", total);
    console.log("📦 Datos de envío:", datosEnvio);

    if (!carrito || !Array.isArray(carrito)) {
      return res.status(400).json({ success: false, message: "Carrito inválido" });
    }

    // === Email productos ===
    const productosHTML = carrito
      .map((p) => `<li>${p.nombre} (x${p.cantidad}) – $${p.precio}</li>`) // Ajustable según tu estructura
      .join("");

    // =============================
    // 1. Envío vía API de Envía.com
    // =============================

    console.log("🚚 Generando guía de envío...");

    const enviaResponse = await fetch(
      "https://api-test.envia.com/ship/generate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ENVIA_API_KEY}`,
          "Content-Type": "application/json",
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
            postalCode: "110111",
          },
          destination: {
            name: datosEnvio.nombre,
            company: "N/A",
            email: datosEnvio.email,
            phone: datosEnvio.telefono,
            street: datosEnvio.direccion,
            number: datosEnvio.numero || "S/N",
            district: datosEnvio.barrio,
            city: datosEnvio.ciudad,
            state: datosEnvio.departamento,
            country: "CO",
            postalCode: datosEnvio.postal || "000000",
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
            comments: "Pedido generado desde Santa Cosmetics",
          },
        }),
      }
    );

    const guia = await enviaResponse.json();
    console.log("📦 Respuesta Envía:", guia);

    // =============================
    // 2. Enviar correo
    // =============================

    const emailBody = `
      <h2>Nuevo pedido recibido</h2>
      <p><strong>Productos:</strong></p>
      <ul>${productosHTML}</ul>
      <p><strong>Total:</strong> $${total}</p>
      <h3>Datos del cliente:</h3>
      <p>${datosEnvio.nombre} – ${datosEnvio.email} – ${datosEnvio.telefono}</p>
      <p>${datosEnvio.direccion}, ${datosEnvio.barrio}, ${datosEnvio.ciudad}</p>
      <h3>Guía generada:</h3>
      <pre>${JSON.stringify(guia, null, 2)}</pre>
    `;

    await transporter.sendMail({
      from: `Santa Cosmetics <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: "Nuevo pedido recibido 💄",
      html: emailBody,
    });

    console.log("📧 Correo enviado correctamente");

    res.json({ success: true, message: "Pedido procesado exitosamente", guia });
  } catch (error) {
    console.error("❌ Error en /checkout:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// === Iniciar servidor ===
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Santa Cosmetics activo en http://localhost:${PORT}`);
});
