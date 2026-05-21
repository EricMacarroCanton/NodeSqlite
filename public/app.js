const artistes = document.getElementById("artist-form");
const album = document.getElementById("album-form");
const actualitzar = document.getElementById("load-btn");
const selector = document.getElementById("artist-select");
const resultats = document.getElementById("artist-output");

artistes.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nom = document.getElementById("artist-name").value;
    const r = await fetch("/api/addData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "artists", camp: "name", valor: nom })
    });
    if (r.ok) { 
        alert("Artista guardat ok"); 
        artistes.reset(); 
    }
});

actualitzar.addEventListener("click", async () => {
    const r = await fetch("/api/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: "artists" })
    });
    const d = await r.json();
    resultats.textContent = d.result.map(x => x.name).join(", ");
    
    selector.innerHTML = '<option value=""> Tria un artista </option>';
    d.result.forEach(i => {
        let opcio = document.createElement("option");
        opcio.value = i.id;
        opcio.textContent = i.name;
        selector.appendChild(opcio);
    });
});

album.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titol = document.getElementById("album-title").value;
    const id_art = selector.value;

    if (!id_art) return alert("Falta triar artista");

    const r = await fetch("/api/addAlbum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titol, artist_id: id_art })
    });

    if (r.ok) {
        alert("Àlbum creat!");
        album.reset();
    }
});

document.getElementById("refrescador").addEventListener("click", async () => {
    const r = await fetch("/api/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: "albums" })
    });
    const d = await r.json();
    const s = document.getElementById("album-delete-select");
    s.innerHTML = '<option value=""> Selecciona un </option>';
    d.result.forEach(a => {
        let o = document.createElement("option");
        o.value = a.id;
        o.textContent = a.title;
        s.appendChild(o);
    });
});

document.getElementById("btn-delete-album").addEventListener("click", async () => {
    const id = document.getElementById("album-delete-select").value;
    if (!id) return;
    if (!confirm("Borrar àlbum?")) return;

    const r = await fetch(`/api/deleteData/albums/${id}`, { method: "DELETE" });
    if (r.ok) {
        alert("Borrat");
        document.getElementById("refrescador").click();
    }
});

document.getElementById("btn-refresh-delete").addEventListener("click", async () => {
    const r = await fetch("/api/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: "artists" })
    });
    const d = await r.json();
    const sel = document.getElementById("artist-delete-select");
    sel.innerHTML = '<option value=""> Tria </option>';
    d.result.forEach(x => {
        let o = document.createElement("option");
        o.value = x.id;
        o.textContent = x.name;
        sel.appendChild(o);
    });
});

document.getElementById("btn-confirm-delete").addEventListener("click", async () => {
    const id = document.getElementById("artist-delete-select").value;
    if (!id) return;
    const r = await fetch(`/api/deleteData/artists/${id}`, { method: "DELETE" });
    if (r.ok) {
        alert("Artista fora");
        document.getElementById("btn-refresh-delete").click();
    }
});

document.getElementById("btn-refresh-edit").addEventListener("click", async () => {
    const r = await fetch("/api/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: "artists" })
    });
    const d = await r.json();
    const sel = document.getElementById("artist-edit-select");
    sel.innerHTML = '<option value=""> Tria un artista </option>';
    d.result.forEach(x => {
        let o = document.createElement("option");
        o.value = x.id;
        o.textContent = x.name;
        sel.appendChild(o);
    });
});

document.getElementById("btn-confirm-edit").addEventListener("click", async () => {
    const id = document.getElementById("artist-edit-select").value;
    const nouNom = document.getElementById("artist-edit-name").value;
    if (!id || !nouNom) return alert("S'ha de triar un artista i escriure un nou nom");

    const r = await fetch(`/api/updateArtist/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nouNom })
    });
    if (r.ok) {
        alert("Artista modificat!");
        document.getElementById("artist-edit-name").value = "";
        document.getElementById("btn-refresh-edit").click();
    }
});

document.getElementById("btn-refresh-song-forms").addEventListener("click", async () => {
    const rArt = await fetch("/api/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: "artists" })
    });
    const dArt = await rArt.json();
    const selArt = document.getElementById("song-artist-select");
    selArt.innerHTML = '<option value=""> Selecciona Artista </option>';
    dArt.result.forEach(x => {
        let o = document.createElement("option");
        o.value = x.id;
        o.textContent = x.name;
        selArt.appendChild(o);
    });

    const rAlb = await fetch("/api/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: "albums" })
    });
    const dAlb = await rAlb.json();
    const selAlb = document.getElementById("song-album-select");
    selAlb.innerHTML = '<option value=""> Selecciona Àlbum </option>';
    dAlb.result.forEach(x => {
        let o = document.createElement("option");
        o.value = x.id;
        o.textContent = x.title;
        selAlb.appendChild(o);
    });
});

const cançoForm = document.getElementById("song-form");
cançoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titolCanço = document.getElementById("song-title").value;
    const idArtista = document.getElementById("song-artist-select").value;
    const idAlbum = document.getElementById("song-album-select").value;

    const r = await fetch("/api/addSong", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titolCanço, album_id: idAlbum, artist_id: idArtista })
    });

    if (r.ok) {
        alert("Cançó guardada correctament!");
        cançoForm.reset();
    }
});

document.getElementById("btn-refresh-songs").addEventListener("click", async () => {
    const r = await fetch("/api/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: "songs" })
    });
    const d = await r.json();
    const s = document.getElementById("song-delete-select");
    s.innerHTML = '<option value=""> Selecciona una cançó </option>';
    d.result.forEach(canc => {
        let o = document.createElement("option");
        o.value = canc.id;
        o.textContent = canc.title;
        s.appendChild(o);
    });
});

document.getElementById("btn-delete-song").addEventListener("click", async () => {
    const id = document.getElementById("song-delete-select").value;
    if (!id) return alert("Tria una cançó");
    if (!confirm("Segur que vols esborrar la cançó?")) return;
});