import express from "express";
import type { Request, Response } from "express";

const app = express();
const port = 3000;

// Tipo de cambio (valor ficticio, puedes actualizarlo dinámicamente)
const EXCHANGE_RATE = 3.75;

app.use(express.json());

// Ruta para convertir de dólares a soles
app.get("/convert/usd-to-pen/:amount", (req: Request, res: Response) => {
  const amount = parseFloat(req.params.amount ?? "0");
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Monto inválido" });
  }
  const converted = amount * EXCHANGE_RATE;
  res.json({ usd: amount, pen: converted, rate: EXCHANGE_RATE });
});

// Ruta para convertir de soles a dólares
app.get("/convert/pen-to-usd/:amount", (req: Request, res: Response) => {
  const amount = parseFloat(req.params.amount ?? "0");
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Monto inválido" });
  }
  const converted = amount / EXCHANGE_RATE;
  res.json({ pen: amount, usd: converted, rate: EXCHANGE_RATE });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
