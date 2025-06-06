function createPreviewItemHTML(content) {
    return `
    <div class="container my-5">
        <div class="row">
            <div class="col-lg-6">
                <h1 class="mb-4">${content.Titulo}</h1>
                <p>${content.parrafo}</p>
                <span>
                    Genero: ${content.categoria_general} | Likes: ${content.likes} | Fecha: ${content.fecha_lanzamiento}
                </span>
            </div>
            <div class="col-lg-6">
                <div class="ratio ratio-16x9">
                    <img src="${content.imagen}" alt="${content.Titulo}" class="img-fluid">
                </div>
            </div>
        </div>
    </div>
    `;
}

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const tituloBuscado = params.get("titulo");

    if (!tituloBuscado) {
        window.location.href = "index.html";
        return;
    }

    const datos = await cargarContenido();

    const contenido = datos.find(item =>
        item.Titulo.toLowerCase() === tituloBuscado.toLowerCase()
    );

    if (contenido) {
        const preview = document.getElementById("preview-placeholder");
        preview.innerHTML = createPreviewItemHTML(contenido);
    } else {
        console.warn("Contenido no encontrado");
        document.getElementById("preview-placeholder").innerHTML = `
            <div class="container my-5">
                <h2 class="text-danger">Contenido no encontrado</h2>
            </div>
        `;
    }
});