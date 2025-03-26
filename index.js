const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

// Datos de prueba
let users = [
  { id: 1, name: "Juan", email: "juan@example.com" },
  { id: 2, name: "Maria", email: "maria@example.com" },
];

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.send("Bienvenido a la API con Express");
});

// Obtener lista de usuarios
app.get("/users", (req, res) => {
  res.json(users);
});

// Agregar un nuevo usuario
app.post("/users", (req, res) => {
  const newUser = { id: users.length + 1, ...req.body };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
