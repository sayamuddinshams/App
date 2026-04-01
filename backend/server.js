const express = require("express");
const { Pool } = require("pg");
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://appuser:apppass@localhost:5432/appdb",
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log("DB initialized: items table ready");
}

app.get("/", (req, res) => {
  res.send(
    "Backend is running. Use GET /api to receive JSON. " +
      "Use /api/items to store/list data. Frontend UI is available at http://localhost:3000/"
  );
});

app.get("/api", (req, res) => {
  res.json({ message: "Hello from Backend 🚀" });
});

app.get("/api/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, text, created_at FROM items ORDER BY created_at DESC");
    res.json({ items: result.rows });
  } catch (err) {
    console.error("GET /api/items", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

app.post("/api/items", async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "The field 'text' is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO items(text) VALUES ($1) RETURNING id, text, created_at",
      [text]
    );
    res.status(201).json({ item: result.rows[0] });
  } catch (err) {
    console.error("POST /api/items", err);
    res.status(500).json({ error: "Failed to insert item" });
  }
});

app.delete("/api/items/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) {
    return res.status(400).json({ error: "Invalid item id" });
  }

  try {
    const result = await pool.query("DELETE FROM items WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ deletedId: id });
  } catch (err) {
    console.error("DELETE /api/items/:id", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

const port = 5000;
initDb()
  .then(() => app.listen(port, () => console.log(`Backend running on port ${port}`)))
  .catch((err) => {
    console.error("Failed to initialize DB", err);
    process.exit(1);
  });
