const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const port = 3000;

app.use(express.json());

// Configuración exacta para tu esquema mySql_db
const pool = mysql.createPool({
  host: "127.0.0.1",
  port: 3306,
  user: "cristian", // Cambia si usas otro usuario
  password: "root", // La que configuraste en MySQL
  database: "mySql_db", // Nombre exacto de tu esquema
  waitForConnections: true,
  connectionLimit: 10,
  authPlugins: {
    mysql_native_password: () =>
      require("mysql2/lib/auth/mysql_native_password"),
  },
});

// Middleware de verificación de esquema
app.use(async (req, res, next) => {
  try {
    const [result] = await pool.query("SELECT DATABASE() AS current_db");
    console.log(`Conectado a esquema: ${result[0].current_db}`);
    next();
  } catch (err) {
    console.error("Error de conexión:", err.code);
    res.status(503).json({
      error: `No se pudo conectar a mySql_db`,
      solución: "Verifica que el esquema exista en MySQL",
    });
  }
});

// Operaciones CRUD optimizadas

// [POST] Crear usuario
app.post("/users", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      error: "Name y email son requeridos",
      formato_correcto: { name: "string", email: "string" },
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO users (name, email) 
       VALUES (?, ?)`,
      [name, email]
    );

    res.status(201).json(newUser[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: `El email '${email}' ya existe`,
        solución: "Usa un email único por usuario",
      });
    }
    res.status(500).json({
      error: "Error en base de datos",
      detalle: err.message,
    });
  }
});

// [GET] Obtener todos los usuarios (con paginación)
app.get("/users", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const [users] = await pool.query(
      `SELECT id, name, email 
       FROM users 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [total] = await pool.query(`SELECT COUNT(*) AS count FROM users`);

    res.json({
      data: users,
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

// Iniciar servidor con verificación
app.listen(port, async () => {
  try {
    const [dbInfo] = await pool.query(`
      SELECT 
        SCHEMA_NAME AS database_name,
        DEFAULT_CHARACTER_SET_NAME AS encoding
      FROM INFORMATION_SCHEMA.SCHEMATA
      WHERE SCHEMA_NAME = 'mySql_db'
    `);

    console.log(`✅ Conectado a MySQL 8.0`);
    console.log(
      `📊 Esquema: ${dbInfo[0].database_name} (${dbInfo[0].encoding})`
    );
    console.log(`🚀 API lista en http://localhost:${port}`);
  } catch (err) {
    console.error("❌ Error crítico:", err.message);
    process.exit(1);
  }
});
