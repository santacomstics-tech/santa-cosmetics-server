const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// === SERVIDOR CORRIENDO ===
app.get("/", (req, res) => {
  res.send("Servidor Santa Cosmetics funcionando ✔");
});

// ====================================================
//  ENVÍO DE CORREO
// ====================================================
app.post("/checkout", async (req, res) => {
  const { carrito, total, buyer, emailTo } = req.body;

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "santacomstics@gmail.com",
      pass: "tu_contraseña_de_aplicacion"  // IMPORTANTE: no tu contraseña normal
    }
  });

  const mensaje = `
  Nuevo pedido recibido:

  Cliente:
  - Nombre: ${buyer.nombre}
  - Dirección: ${buyer.direccion}
  - Ciudad: ${buyer.ciudad}
  - Teléfono: ${buyer.telefono}
  - Correo: ${buyer.correo}

  Productos:
  ${carrito.map(i => "- " + i).join("\n")}

  Total: $${total.toLocaleString("es-CO")}
  `;

  try {
    await transport.sendMail({
      from: "Santa Cosmetics <santacomstics@gmail.com>",
      to: emailTo,
      subject: "Nuevo pedido desde Santa Cosmetics",
      text: mensaje
    });

    res.json({ success: true });
  } catch (error) {
    console.log("Error enviando correo:", error);
    res.json({ success: false, error });
  }
});

// ====================================================
// PUERTO PARA RENDER
// ====================================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Servidor activo en puerto", PORT));
