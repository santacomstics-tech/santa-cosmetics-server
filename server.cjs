// ===============================
// Servidor Santa Cosmetics
// ===============================
require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// === Variables desde .env en Render ===
const EMAIL_USER = process.env.EMAIL_USER || "santacomstics@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "lprdklcqwgzotcoe";
const ENVIA_API_KEY = process.env.ENVIA_API_KEY;

// === Middleware ===
app.use(express.json());    // 👌 Reemplaza body-parser
app.use(express.static(path.join(__dirname, "public")));

// === Transporter de correo ===
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Ruta productos.html
app.get("/productos", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "productos.html"));
});

// ========================================
//  CHECKOUT
// ========================================
app.post("/checkout", async (req, res) => {
  try {
    const { carrito, total, datosEnvio } = req.body;

    console.log("🛍 Carrito:", carrito);
    console.log("💰 Total:", total);
    console.log("📦 Datos de envío:", datosEnvio);

    if (!carrito || !Array.isArray(carrito)) {
      return res.status(400).json({
        success: false,
        message: "Carrito inválido o vacío",
      });
    }

    // Convertir productos a HTML
    const productosHTML = carrito
      .map(
        (p) =>
          `<li>${p.nombre} (x${p.cantidad}) – $${p.precio * p.cantidad}</li>`
      )
      .join("");

    // =============================
    // 1. Generar guía con ENVIA
    // =============================
    console.log("🚚 Generando guía con Envía...");

    const guiaResponse = await fetch(
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
            street: "Calle Falsa 123",
            number: "123",
            district: "Centro",
            city: "Bogota",
            state: "Cundinamarca",
            country: "CO",
            postalCode: "110111",
          },
          destination: {
            name: datosEnvio.nombre,
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
          shipment: { carrier: "ENVIA", type: 1 },
          settings: { printFormat: "PDF", printSize: "STOCK_4X6" },
        }),
      }
    );

    const guia = await guiaResponse.json();
    console.log("📦 Respuesta de Envía:", guia);

    // =============================
    // 2. Enviar correo
    // =============================
    const emailBody = `
      <h2>Nuevo pedido recibido 🛍</h2>

      <p><strong>Productos:</strong></p>
      <ul>${productosHTML}</ul>

      <p><strong>Total:</strong> $${total}</p>

      <h3>Datos del cliente:</h3>
      <p>${datosEnvio.nombre}</p>
      <p>${datosEnvio.email} – ${datosEnvio.telefono}</p>
      <p>${datosEnvio.direccion}, ${datosEnvio.barrio}, ${datosEnvio.ciudad}</p>

      <h3>Guía generada (Envía):</h3>
      <pre>${JSON.stringify(guia, null, 2)}</pre>
    `;

    await transporter.sendMail({
      from: `Santa Cosmetics <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: "Nuevo pedido recibido 💄",
      html: emailBody,
    });

    console.log("📧 Correo enviado con éxito");

    res.json({
      success: true,
      message: "Pedido completado, correo enviado y guía generada.",
      guia,
    });
  } catch (error) {
    console.error("❌ Error en /checkout:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===============================
// Iniciar servidor
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
});
