const express = require("express");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "artists.db");
fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist_id INTEGER,
    FOREIGN KEY(artist_id) REFERENCES artists(id)
  )`);
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Endpoint per afegir dades genèriques (Corregit)
app.post("/api/addData", (req, res) => {
  const { table, camp, valor } = req.body;
  const sql = `INSERT INTO ${table} (${camp}) VALUES (?)`;
  
  db.run(sql, [valor], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Dada desada correctament", id: this.lastID });
  });
});

app.post("/api/addAlbum", (req, res) => {
  const { title, artist_id } = req.body;
  const sql = `INSERT INTO albums (title, artist_id) VALUES (?, ?)`;
  
  db.run(sql, [title, artist_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Àlbum desat" });
  });
});

app.post("/api/artists", (req, res) => {
  const table = req.body.data;
  db.all(`SELECT * FROM ${table} ORDER BY id DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ result: rows });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor a http://localhost:${PORT}`);
});