const mysql = require("mysql");
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
    pool.query(getUsersQuery, [limit, offset], (error, users) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      pool.query(countQuery, (countError, total) => {
        if (countError) {
          return res.status(500).json({ error: countError.message });
        }

        res.json({
          data: users,
          pagination: {
            page,
            limit,
            total: total[0].count,
            totalPages: Math.ceil(total[0].count / limit),
          },
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
