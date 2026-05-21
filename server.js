const express = require("express");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;

const dir = path.join(__dirname, "data");
const fitxerDB = path.join(dir, "musica.db"); 
fs.mkdirSync(dir, { recursive: true });

const db = new sqlite3.Database(fitxerDB);

db.run("CREATE TABLE IF NOT EXISTS artists (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)");
db.run("CREATE TABLE IF NOT EXISTS albums (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, artist_id INTEGER, FOREIGN KEY(artist_id) REFERENCES artists(id))");
db.run("CREATE TABLE IF NOT EXISTS songs (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, album_id INTEGER, artist_id INTEGER, FOREIGN KEY(album_id) REFERENCES albums(id), FOREIGN KEY(artist_id) REFERENCES artists(id))");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/addData", function(req, res) {
  const { table, camp, valor } = req.body;
  db.run(`INSERT INTO ${table} (${camp}) VALUES (?)`, [valor], (err) => {
    if (err) return res.status(500).send(err.message);
    res.status(201).send("ok");
  });
});

app.post("/api/addAlbum", function(req, res) {
  const { title, artist_id } = req.body;
  db.run(`INSERT INTO albums (title, artist_id) VALUES (?, ?)`, [title, artist_id], (err) => {
    if (err) return res.status(500).send(err.message);
    res.status(201).send("ok");
  });
});

app.post("/api/artists", (req, res) => {
  const taula = req.body.data;
  console.log("Demanant dades de la taula: " + taula);
  db.all(`SELECT * FROM ${taula} ORDER BY id DESC`, (err, files) => {
    if (err) {
        console.log("error a la consulta"); 
        return res.status(500).send(err.message);
    }
    res.json({ result: files });
  });
});

app.delete("/api/deleteData/:table/:id", function(req, res) {
  const t = req.params.table;
  const id = req.params.id;
  db.run(`DELETE FROM ${t} WHERE id = ?`, [id], (err) => {
    if (err) return res.status(500).send(err.message);
    res.json({ status: "borrat" });
  });
});
app.put("/api/updateArtist/:id", function(req, res) {
  const id = req.params.id;
  const { name } = req.body;
  db.run(`UPDATE artists SET name = ? WHERE id = ?`, [name, id], (err) => {
    if (err) return res.status(500).send(err.message);
    res.json({ status: "modificat" });
  });
});

app.post("/api/addSong", function(req, res) {
  const { title, album_id, artist_id } = req.body;
  db.run(`INSERT INTO songs (title, album_id, artist_id) VALUES (?, ?, ?)`, [title, album_id, artist_id], (err) => {
    if (err) return res.status(500).send(err.message);
    res.status(201).send("ok");
  });
});
const PORT = 3000;

app.listen(PORT, () => console.log(`Servidor a http://localhost:${PORT}`));