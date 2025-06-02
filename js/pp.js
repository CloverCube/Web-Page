function pelicula() {
    cargarContenido().then((data) => {
        const contenedor = document.getElementById("post-pelicula");

        data.sort((a, b) => new Date(b.fecha_lanzamiento) - new Date(a.fecha_lanzamiento));

        let html = data.map(createItemHTML).join("");
        contenedor.innerHTML = html;
    });
}