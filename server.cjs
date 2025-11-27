import express from "express";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json());

// ======== CONFIGURA TU CORREO AQUI ========

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "TU_CORREO@gmail.com",
    pass: "TU_CONTRASEÑA_DE_APP"  
  }
});

// ======== RUTA QUE RECIBE PEDIDOS ========
app.post("/enviar-correo", async (req, res) => {
  const { nombre, direccion, telefono, carrito, total } = req.body;

  const productosHTML = carrito
    .map(p => `${p.nombre} - ${p.seleccion} ($${p.precio})`)
    .join("<br>");

  const mensaje = `
    <h2>Nuevo Pedido</h2>
    <p><strong>Nombre:</strong> ${nombre}</p>
    <p><strong>Dirección:</strong> ${direccion}</p>
    <p><strong>Teléfono:</strong> ${telefono}</p>
    <h3>Productos:</h3>
    <p>${productosHTML}</p>
    <p><strong>Total:</strong> $${total}</p>
  `;

  try {
    await transporter.sendMail({
      from: "Santa Cosmetics",
      to: "TU_CORREO_DESTINO@gmail.com",
      subject: "Nuevo Pedido",
      html: mensaje
    });

    res.json({ ok: true });
  } catch (error) {
    console.log(error);
    res.json({ ok: false });
  }
});

// Puerto para Render
app.listen(10000, () => console.log("Servidor activo"));
