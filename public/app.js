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