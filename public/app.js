const formArtist = document.getElementById("artist-form");
const formAlbum = document.getElementById("album-form");
const loadBtn = document.getElementById("load-btn");
const artistSelect = document.getElementById("artist-select");
const artistOutput = document.getElementById("artist-output");


formArtist.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("artist-name").value;
    const res = await fetch("/api/addData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "artists", camp: "name", valor: name })
    });
    if (res.ok) { alert("Artista desat!"); formArtist.reset(); }
});

loadBtn.addEventListener("click", async () => {
    const res = await fetch("/api/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: "artists" })
    });
    const json = await res.json();
    artistOutput.textContent = json.result.map(a => a.name).join(", ");
    
    artistSelect.innerHTML = '<option value=""> Selecciona artista </option>';
    json.result.forEach(a => {
        let opt = document.createElement("option");
        opt.value = a.id;
        opt.textContent = a.name;
        artistSelect.appendChild(opt);
    });
});


formAlbum.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("album-title").value;
    const artist_id = artistSelect.value;

    console.log("Intentant desar àlbum:", { title, artist_id });

    if (!artist_id) return alert("Selecciona un artista");

    const res = await fetch("/api/addAlbum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, artist_id })
    });

    if (res.ok) {
        alert("Àlbum creat");
        formAlbum.reset();
    } else {
        alert("Error en desar l'àlbum");
    }
});


document.getElementById("btn-refresh-albums").addEventListener("click", async () => {
    const res = await fetch("/api/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: "albums" })
    });
    const json = await res.json();
    const sel = document.getElementById("album-delete-select");
    sel.innerHTML = '<option value=""> Selecciona àlbum</option>';
    json.result.forEach(alb => {
        let opt = document.createElement("option");
        opt.value = alb.id;
        opt.textContent = alb.title;
        sel.appendChild(opt);
    });
});

document.getElementById("btn-delete-album").addEventListener("click", async () => {
    const id = document.getElementById("album-delete-select").value;
    if (!id) return alert("Tria un àlbum!");
    if (!confirm("Eliminar l'àlbum?")) return;

    const res = await fetch(`/api/deleteData/albums/${id}`, { method: "DELETE" });
    if (res.ok) {
        alert("Àlbum eliminat");
        document.getElementById("btn-refresh-albums").click();
    }
});


document.getElementById("btn-refresh-delete").addEventListener("click", async () => {
    const res = await fetch("/api/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: "artists" })
    });
    const json = await res.json();
    const sel = document.getElementById("artist-delete-select");
    sel.innerHTML = '<option value=""> Selecciona artista </option>';
    json.result.forEach(a => {
        let opt = document.createElement("option");
        opt.value = a.id;
        opt.textContent = a.name;
        sel.appendChild(opt);
    });
});

document.getElementById("btn-confirm-delete").addEventListener("click", async () => {
    const id = document.getElementById("artist-delete-select").value;
    if (!id) return alert("Tria artista!");
    const res = await fetch(`/api/deleteData/artists/${id}`, { method: "DELETE" });
    if (res.ok) {
        alert("Artista eliminat");
        document.getElementById("btn-refresh-delete").click();
    }
});