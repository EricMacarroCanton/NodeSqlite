const form = document.getElementById("artist-form");
const albumForm = document.getElementById("album-form");
const loadButton = document.getElementById("load-btn");
const artistOutput = document.getElementById("artist-output");
const artistNameInput = document.getElementById("artist-name");
const testAddButton = document.getElementById("testAdd");

form.addEventListener("submit", async (event) => {
    event.preventDefault(); 
    const name = artistNameInput.value.trim();
    if (!name) return;

    const res = await fetch("/api/addData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "artists", camp: "name", valor: name })
    });

    if (res.ok) {
        artistOutput.textContent = "Artista " + name + " desat correctament!";
        form.reset();
    }
});

loadButton.addEventListener("click", async () => {
    const res = await fetch("/api/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: "artists" })
    });

    const json = await res.json();
    
    artistOutput.textContent = json.result.map(a => a.name).join(", ");

    // Omplir el selector d'àlbums (Requisit PDF)[cite: 1]
    const select = document.getElementById("artist-select");
    if (select) {
        select.innerHTML = '<option value="">Selecciona un artista...</option>';
        json.result.forEach(a => {
            let opt = document.createElement("option");
            opt.value = a.id;
            opt.textContent = a.name;
            select.appendChild(opt);
        });
    }
});

albumForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = document.getElementById("album-title").value;
    const artist_id = document.getElementById("artist-select").value;

    if (!artist_id) return alert("Selecciona un artista primer");

    const res = await fetch("/api/addAlbum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, artist_id })
    });

    if (res.ok) {
        alert("Àlbum desat!");
        albumForm.reset();
    }
});

testAddButton.addEventListener("click", async () => {
    const res = await fetch("/api/addData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "artists", camp: "name", valor: "Bon Jovi" })
    });
    const message = await res.json();
    console.log(message);
});