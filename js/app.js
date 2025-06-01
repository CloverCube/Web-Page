frontPagePop();

const frontPopular = document.getElementById("popular");
const frontLast = document.getElementById("ultimos");

frontPopular.addEventListener("click", frontPagePop);
frontLast.addEventListener("click", frontDate);

function frontPagePop() {
    cargarContenido().then((data) => {
        const contenedor = document.getElementById("Generate");
        
        let html = data.map(createItemHTML).join("");
        contenedor.innerHTML = html;
    });
}

function frontDate() {
    cargarContenido().then((data) => {
        const contenedor = document.getElementById("Generate");

        data.sort((a, b) => new Date(b.fecha_lanzamiento) - new Date(a.fecha_lanzamiento));

        let html = data.map(createItemHTML).join("");
        contenedor.innerHTML = html;
    });
}

async function cargarContenido() {
    try {
        const resAPI = await fetch("http://localhost:3000/api/contenidos");
        if (!resAPI.ok) throw new Error("API no disponible");
        const contenidosBD = await resAPI.json();

        const resJSON = await fetch("../content/page/content.json");
        if (!resJSON.ok) throw new Error("JSON local no disponible");
        const contenidosJSON = await resJSON.json();

        const contenidosCombinados = contenidosBD.map((itemBD) => {
            const match = contenidosJSON.find(
                (itemJSON) =>
                    itemJSON.titulo?.toLowerCase() === itemBD.Titulo.toLowerCase()
            );

            return {
                ...itemBD,
                imagen: match?.imagen || "",
                url_page: match?.url_page || "#",
                parrafo: match?.parrafo || "",
                likes: match?.likes || 0,
            };
        });

        return contenidosCombinados;
    } catch (error) {
        console.error("Error cargando datos:", error.message);
        return [];
    }
}

function createItemHTML(content) {
    return `
    <div class="row my-3">
        <div class="col-3">
            <img src="${content.imagen}" alt="${content.Titulo}">
        </div>
        <div class="col">
            <a href="${content.url_page}"><h2>${content.Titulo}</h2></a>
            <p>${content.parrafo}</p>
            <span>${content.genero} | </span>
            <span>${content.tipo} | </span>
            <span>Likes: ${content.likes} | </span>
            <span>Fecha: ${content.fecha_lanzamiento}</span>
        </div>
    </div>
  `;
}