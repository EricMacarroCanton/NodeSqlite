const express = require("express");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "artists.db");

fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error("Error opening database:", error.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");

  db.run(`
    CREATE TABLE IF NOT EXISTS artists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      artist_id INTEGER NOT NULL,
      collaborator_id INTEGER,
      FOREIGN KEY(artist_id) REFERENCES artists(id) ON DELETE CASCADE,
      FOREIGN KEY(collaborator_id) REFERENCES artists(id) ON DELETE SET NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      album_id INTEGER NOT NULL,
      FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE
    )
  `);

  const initialArtists = ["Txarango", "Oques Grasses"];
  initialArtists.forEach((artist) => {
    db.get("SELECT id FROM artists WHERE name = ?", [artist], (error, row) => {
      if (error) {
        console.error("Error comprobando artista inicial:", error.message);
        return;
      }
      if (!row) {
        db.run("INSERT INTO artists (name) VALUES (?)", [artist]);
      }
    });
  });
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function sendError(res, error, status = 500) {
  const message = error && error.message ? error.message : error;
  res.status(status).json({ error: message });
}

app.get("/api/artists", (req, res) => {
  db.all("SELECT id, name FROM artists ORDER BY id DESC", (error, rows) => {
    if (error) return sendError(res, error);
    res.json(rows);
  });
});

app.post("/api/artists", (req, res) => {
  const name = (req.body.name || "").trim();
  if (!name) return sendError(res, "El nomb del artista es obligatori.", 400);

  db.run("INSERT INTO artists (name) VALUES (?)", [name], function (error) {
    if (error) return sendError(res, error);
    res.status(201).json({ id: this.lastID, name, message: "Artista afegit" });
  });
});

app.put("/api/artists/:id", (req, res) => {
  const id = Number(req.params.id);
  const name = (req.body.name || "").trim();
  if (!name) return sendError(res, "El nom del artista es obligatori.", 400);

  db.run("UPDATE artists SET name = ? WHERE id = ?", [name, id], function (error) {
    if (error) return sendError(res, error);
    if (this.changes === 0) return sendError(res, "Artista no encontrado.", 404);
    res.json({ id, name, message: "Artista modificado" });
  });
});

app.delete("/api/artists/:id", (req, res) => {
  const id = Number(req.params.id);
  db.run("DELETE FROM artists WHERE id = ?", [id], function (error) {
    if (error) return sendError(res, error);
    if (this.changes === 0) return sendError(res, "Artista no trobat.", 404);
    res.json({ id, message: "Artista eliminado" });
  });
});

app.get("/api/albums", (req, res) => {
  const artistId = req.query.artistId ? Number(req.query.artistId) : null;
  const baseQuery = `
    SELECT
      albums.id,
      albums.name,
      albums.artist_id,
      albums.collaborator_id,
      a1.name AS artist_name,
      a2.name AS collaborator_name
    FROM albums
    LEFT JOIN artists a1 ON albums.artist_id = a1.id
    LEFT JOIN artists a2 ON albums.collaborator_id = a2.id
  `;

  if (artistId) {
    db.all(`${baseQuery} WHERE albums.artist_id = ? OR albums.collaborator_id = ? ORDER BY albums.id DESC`, [artistId, artistId], (error, rows) => {
      if (error) return sendError(res, error);
      res.json(rows);
    });
  } else {
    db.all(`${baseQuery} ORDER BY albums.id DESC`, (error, rows) => {
      if (error) return sendError(res, error);
      res.json(rows);
    });
  }
});

app.post("/api/albums", (req, res) => {
  const name = (req.body.name || "").trim();
  const artistId = Number(req.body.artistId);
  const collaboratorId = req.body.collaboratorId ? Number(req.body.collaboratorId) : null;

  if (!name) return sendError(res, "El nomb del álbum es obligatori.", 400);
  if (!artistId) return sendError(res, "El artista principal es obligatori.", 400);
  if (collaboratorId && collaboratorId === artistId) return sendError(res, "El artista colaborador no puede ser el mismo que el principal.", 400);

  db.run("INSERT INTO albums (name, artist_id, collaborator_id) VALUES (?, ?, ?)", [name, artistId, collaboratorId], function (error) {
    if (error) return sendError(res, error);
    res.status(201).json({ id: this.lastID, name, artistId, collaboratorId, message: "Álbum afegit" });
  });
});

app.delete("/api/albums/:id", (req, res) => {
  const id = Number(req.params.id);
  db.run("DELETE FROM albums WHERE id = ?", [id], function (error) {
    if (error) return sendError(res, error);
    if (this.changes === 0) return sendError(res, "Álbum no trobat.", 404);
    res.json({ id, message: "Álbum eliminado" });
  });
});

app.get("/api/songs", (req, res) => {
  const albumId = req.query.albumId ? Number(req.query.albumId) : null;
  const baseQuery = `
    SELECT
      songs.id,
      songs.name,
      songs.album_id,
      albums.name AS album_name,
      albums.artist_id,
      albums.collaborator_id,
      a1.name AS artist_name,
      a2.name AS collaborator_name
    FROM songs
    JOIN albums ON songs.album_id = albums.id
    LEFT JOIN artists a1 ON albums.artist_id = a1.id
    LEFT JOIN artists a2 ON albums.collaborator_id = a2.id
  `;

  if (albumId) {
    db.all(`${baseQuery} WHERE songs.album_id = ? ORDER BY songs.id DESC`, [albumId], (error, rows) => {
      if (error) return sendError(res, error);
      res.json(rows);
    });
  } else {
    db.all(`${baseQuery} ORDER BY songs.id DESC`, (error, rows) => {
      if (error) return sendError(res, error);
      res.json(rows);
    });
  }
});

app.post("/api/songs", (req, res) => {
  const name = (req.body.name || "").trim();
  const albumId = Number(req.body.albumId);

  if (!name) return sendError(res, "El nom de la cançó es obligatori.", 400);
  if (!albumId) return sendError(res, "El àlbum es obligatori.", 400);

  db.run("INSERT INTO songs (name, album_id) VALUES (?, ?)", [name, albumId], function (error) {
    if (error) return sendError(res, error);
    res.status(201).json({ id: this.lastID, name, albumId, message: "Canço afegida" });
  });
});

app.delete("/api/songs/:id", (req, res) => {
  const id = Number(req.params.id);
  db.run("DELETE FROM songs WHERE id = ?", [id], function (error) {
    if (error) return sendError(res, error);
    if (this.changes === 0) return sendError(res, "Cançó no trobada.", 404);
    res.json({ id, message: "Cançó eliminada" });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor a http://localhost:${PORT}`);
  console.log(`Base de dades SQLite: ${dbPath}`);
});

