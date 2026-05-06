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
        body: JSON.stringify({ table: "artists", camp: "name", valor: "Quevedo" })
    });
    const message = await res.json();
    console.log(message);
});

document.getElementById("btn-refresh-delete").addEventListener("click", async () => {
    try {
        const res = await fetch("/api/artists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: "artists" })
        });
        const json = await res.json();
        
        const selectDelete = document.getElementById("artist-delete-select");
        selectDelete.innerHTML = '<option value="">-- Selecciona un artista --</option>';
        
        json.result.forEach(artista => {
            let opt = document.createElement("option");
            opt.value = artista.id;
            opt.textContent = artista.name;
            selectDelete.appendChild(opt);
        });
        
        console.log("Desplegable d'eliminació actualitzat");
    } catch (error) {
        console.error("Error carregant llista d'eliminació:", error);
    }
});

document.getElementById("btn-confirm-delete").addEventListener("click", async () => {
    const idParaBorrar = document.getElementById("artist-delete-select").value;

    if (!idParaBorrar) {
        alert("Si us plau, selecciona un artista primer.");
        return;
    }

    if (!confirm("Estàs segur? Aquesta acció no es pot desfer.")) return;

    try {
        const res = await fetch(`/api/deleteData/artists/${idParaBorrar}`, {
            method: "DELETE"
        });

        if (res.ok) {
            alert("Artista eliminat amb èxit.");
            // Netegem el desplegable i actualitzem la llista general
            document.getElementById("btn-refresh-delete").click();
            if(document.getElementById("load-btn")) document.getElementById("load-btn").click();
        } else {
            alert("Error en eliminar l'artista.");
        }
    } catch (error) {
        console.error("Error en la petició DELETE:", error);
    }
});