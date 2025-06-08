document.getElementById("contenidosForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const datos = {};
    formData.forEach((value, key) => datos[key] = value);

    try {
        const res = await fetch("http://localhost:3000/api/contenidos/nuevo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        const result = await res.json();
        if (res.ok) {
            alert("Contenido guardado con éxito.");
            this.reset();
        } else {
            alert("Error: " + result.error);
        }
    } catch (error) {
        console.error("Error al guardar contenido:", error);
        alert("Error al guardar contenido.");
    }
});