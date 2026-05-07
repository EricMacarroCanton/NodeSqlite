const express = require("express");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;

const dir = path.join(__dirname, "data");
const fitxerDB = path.join(dir, "musica.db"); // He canviat el nom del fitxer .db
fs.mkdirSync(dir, { recursive: true });

const db = new sqlite3.Database(fitxerDB);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS artists (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)`);
  db.run(`CREATE TABLE IF NOT EXISTS albums (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, artist_id INTEGER, FOREIGN KEY(artist_id) REFERENCES artists(id))`);
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/addData", (req, res) => {
  const { table, camp, valor } = req.body;
  db.run(`INSERT INTO ${table} (${camp}) VALUES (?)`, [valor], (err) => {
    if (err) return res.status(500).send(err.message);
    res.status(201).send("ok");
  });
});

app.post("/api/addAlbum", (req, res) => {
  const { title, artist_id } = req.body;
  db.run(`INSERT INTO albums (title, artist_id) VALUES (?, ?)`, [title, artist_id], (err) => {
    if (err) return res.status(500).send(err.message);
    res.status(201).send("ok");
  });
});

app.post("/api/artists", (req, res) => {
  const taula = req.body.data;
  db.all(`SELECT * FROM ${taula} ORDER BY id DESC`, (err, files) => {
    if (err) return res.status(500).send(err.message);
    res.json({ result: files });
  });
});

app.delete("/api/deleteData/:table/:id", (req, res) => {
  const t = req.params.table;
  const id = req.params.id;
  db.run(`DELETE FROM ${t} WHERE id = ?`, [id], (err) => {
    if (err) return res.status(500).send(err.message);
    res.json({ status: "borrat" });
  });
});

app.listen(port, () => console.log("Servidor en marxa al port " + port));