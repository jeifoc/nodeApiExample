const mysql = require("mysql2/promise"); // Usamos mysql2 con promesas
const express = require("express");
const app = express();
const port = 3000;

// Configuración de la conexión MySQL
const pool = mysql.createPool({
  connectionLimit: 10,
  port: "3306", // Cambia esto por tu puerto de MySQL
  host: "localhost", // Cambia esto por tu host
  user: "cristian", // Cambia por tu usuario de MySQL
  password: "root", // Cambia por tu contraseña
  database: "mySql_db", // Cambia por el nombre de tu base de datos
  waitForConnections: true,
  queueLimit: 0,
});

app.use(express.json());

// Endpoint GET /users con paginación
app.get("/users", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // Consulta para obtener usuarios paginados
    const getUsersQuery = "SELECT id, name, email FROM users LIMIT ? OFFSET ?";

    // Consulta para contar el total de usuarios
    const countQuery = "SELECT COUNT(*) AS count FROM users";

    // Ejecutar ambas consultas en paralelo
    const [users, [total]] = await Promise.all([
      pool.query(getUsersQuery, [limit, offset]),
      pool.query(countQuery),
    ]);

    res.json({
      data: users[0],
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint POST /users para crear nuevos usuarios
app.post("/users", async (req, res) => {
  const { name, email } = req.body;

  // Validación básica
  if (!name || !email) {
    return res.status(400).json({ error: "Nombre y email son requeridos" });
  }

  try {
    // Consulta para insertar nuevo usuario
    const insertQuery = "INSERT INTO users (name, email) VALUES (?, ?)";
    const [result] = await pool.query(insertQuery, [name, email]);

    // Consulta para obtener el usuario recién creado
    const [newUser] = await pool.query(
      "SELECT id, name, email FROM users WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Usuario creado exitosamente",
      user: newUser[0],
    });
  } catch (err) {
    // Manejo de errores específicos
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El email ya está registrado" });
    }
    res.status(500).json({ error: err.message });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
