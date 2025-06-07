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

function createContentsSecondHTML(content) {
    return `
        <h2>${content.titulo_second}</h2>
        <p>${content.content_second || "Contenido en desarrollo. Pronto disponible."}</p>
    `;
}

function createContentsThreeHTML(content) {
    return `
        <h2>${content.titulo_three}</h2>
        <p>${content.content_three || "Contenido en desarrollo. Pronto disponible."}</p>
    `;
}

function createContentsFourHTML(content) {
    return `
        <h2>${content.titulo_four}</h2>
        <p>${content.content_four || "Contenido en desarrollo. Pronto disponible."}</p>
    `;
}

async function cargarSubContenido() {
    try {
        const resAPI = await fetch("http://localhost:3000/api/contenidos");
        if (!resAPI.ok) throw new Error("API no disponible");
        const contenidosBD = await resAPI.json();

        const resJSON = await fetch("/content/page/subpage_content.json");
        if (!resJSON.ok) throw new Error("JSON local no disponible");
        const contenidosJSON = await resJSON.json();

        const contenidosCombinados = contenidosBD.map((itemBD) => {
            const match = contenidosJSON.find(
                (itemJSON) =>
                    itemJSON.titulo?.toLowerCase() === itemBD.Titulo.toLowerCase()
            );

            const fecha = new Date(itemBD.fecha_lanzamiento);
            const ano = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(fecha.getDate()).padStart(2, '0');
            const soloFecha = `${ano}-${mes}-${dia}`;

            return {
                ...itemBD,
                fecha_lanzamiento: soloFecha || itemBD.fecha_lanzamiento,
                parrafo: itemBD.Descripcion || match?.parrafo || "",
                likes: itemBD.Likes || 0,
                categoria_general: itemBD.genero || "",
                tipo: itemBD.tipo || "",
                titulo_second: match?.titulo_second || "",
                content_second: match?.content_second || "",
                titulo_three: match?.titulo_three || "",
                content_three: match?.content_three || "",
                titulo_four: match?.titulo_four || "",
                content_four: match?.content_four || "",
            };
        });

        return contenidosCombinados;
    } catch (error) {
        console.error("Error cargando datos:", error.message);
        return [];
    }
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
        const headerTitle = document.getElementById("title-placeholder");
        headerTitle.innerHTML = `
            <h1 class="display-4 fw-bold">
                <span class="text-orange">PIXEL</span>
                <span class="text-blue">&</span>
                <span class="text-orange">F</span><span class="text-blue">RAME</span>
            </h1>
            <h2 class="lead">${tituloBuscado}</h2>`;

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

    const datosContent = await cargarSubContenido();

    const subContent = datos.find(item =>
        item.Titulo.toLowerCase() === tituloBuscado.toLowerCase()
    );

    if (subContent) {
        const secondContent = document.getElementById("content-second-placeholder");
        const threeContent = document.getElementById("content-three-placeholder");
        const fourContent = document.getElementById("content-four-placeholder");

        secondContent.innerHTML = createContentsSecondHTML(subContent);
        threeContent.innerHTML = createContentsThreeHTML(subContent);
        fourContent.innerHTML = createContentsFourHTML(subContent);
    } else {
        console.warn("Sub Contenido no encontrado");
        document.getElementById("content-second-placeholder").innerHTML = `
            <div class="container my-5">
                <h2 class="text-danger">Contenido no encontrado</h2>
            </div>
        `;

        document.getElementById("content-three-placeholder").innerHTML = `
            <div class="container my-5">
                <h2 class="text-danger">Contenido no encontrado</h2>
            </div>
        `;

        document.getElementById("content-four-placeholder").innerHTML = `
            <div class="container my-5">
                <h2 class="text-danger">Contenido no encontrado</h2>
            </div>
        `;
    }

    const areaResena = document.getElementById('form-resenas-placeholder');
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) {
        areaResena.innerHTML = `<p>Debes <a href="javascript:void(0)" id="abrirLoginModal">iniciar sesión</a> para dejar una reseña.</p>`;

        document.getElementById('abrirLoginModal').addEventListener('click', (e) => {
            e.preventDefault();
            const modal = new bootstrap.Modal(document.getElementById("loginModal"));
            modal.show();
        });
    } else {
        areaResena.innerHTML = `
            <form id="form-resena">
                <input type="number" id="calificacion" placeholder="Calificación (1-10)" min="1" max="10" required><br>
                <textarea id="comentario" placeholder="Escribe tu reseña..." required></textarea><br>
                <button type="submit">Enviar Reseña</button>
            </form>
        `;

        document.getElementById('form-resena').addEventListener('submit', async (e) => {
            e.preventDefault();

            const usuarioId = usuario.UsuarioID;

            const calificacion = document.getElementById('calificacion').value;
            const comentario = document.getElementById('comentario').value;

            await fetch('http://localhost:3000/resenas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId, titulo: tituloObra, calificacion, comentario })
            });

            document.getElementById('form-resena').reset();
        });
    }

    const res = await fetch(`http://localhost:3000/api/resenas/titulo/${encodeURIComponent(tituloBuscado)}`);
    const resenas = await res.json();

    const lista = document.getElementById('resenas-placeholder');
    lista.innerHTML = '';
    resenas.forEach(r => {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${r.NombreUsuario}</strong> calificó con <b>${r.Calificacion}/10</b><br>
                                 "${r.Comentario}"<br>
                                 <small>${new Date(r.FechaReseña).toLocaleString()}</small><hr>`;
        lista.appendChild(div);
    });
});