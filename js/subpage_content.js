function createPreviewItemHTML(content, fav) {
    if (fav) return `
        <div class="container my-5">
        <div class="row">
            <div class="col-lg-6">
                <h1 class="mb-4">${content.Titulo}</h1>
                <p>${content.parrafo}</p>
                <div class="mb-2">
                    <span><strong>Género:</strong> ${content.categoria_general}</span><br>
                    <span><strong>Likes:</strong> ${content.likes}</span><br>
                    <span><strong>Fecha de lanzamiento:</strong> ${content.fecha_lanzamiento}</span>
                </div>
            
                <button class="btn btn-outline-danger mt-3" id="fav-btn" onclick="toggleFavorito()">💔 Quitar de Favoritos</button>
            
                <div id="mensaje-favorito" class="mt-2 text-success d-none"></div>
            </div>
        
            <div class="col-lg-6">
                <div class="ratio ratio-16x9">
                    <img src="${content.imagen}" alt="${content.Titulo}" class="img-fluid rounded shadow-sm">
                </div>
            </div>
        </div>
        </div>
    `;
    else return `
        <div class="container my-5">
        <div class="row">
            <div class="col-lg-6">
                <h1 class="mb-4">${content.Titulo}</h1>
                <p>${content.parrafo}</p>
                <div class="mb-2">
                    <span><strong>Género:</strong> ${content.categoria_general}</span><br>
                    <span><strong>Likes:</strong> ${content.likes}</span><br>
                    <span><strong>Fecha de lanzamiento:</strong> ${content.fecha_lanzamiento}</span>
                </div>
            
                <button class="btn btn-outline-primary mt-3" id="fav-btn" onclick="toggleFavorito()">❤️ Agregar a Favoritos</button>
            
                <div id="mensaje-favorito" class="mt-2 text-success d-none">Agregado a favoritos.</div>
            </div>
        
            <div class="col-lg-6">
                <div class="ratio ratio-16x9">
                    <img src="${content.imagen}" alt="${content.Titulo}" class="img-fluid rounded shadow-sm">
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

        try {
            const usuario = JSON.parse(localStorage.getItem("usuario"));
            if (!usuario) {
                preview.innerHTML = createPreviewItemHTML(contenido, false);
            } else {
                const res = await fetch(`http://localhost:3000/api/favoritos?usuarioID=${usuario.UsuarioID}&titulo=${encodeURIComponent(tituloBuscado)}`);
                const data = await res.json();

                const btn = document.getElementById("fav-btn");

                preview.innerHTML = createPreviewItemHTML(contenido, data.favorito);
            }
        } catch (err) {
            console.error("Error al verificar favoritos:", err);
        }
    } else {
        console.warn("Contenido no encontrado");
        document.getElementById("preview-placeholder").innerHTML = `
            <div class="container my-5">
                <h2 class="text-danger">Contenido no encontrado</h2>
            </div>
        `;
    }

    const datosContent = await cargarSubContenido();

    const subContent = datosContent.find(item =>
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

async function toggleFavorito() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
        document.getElementById('fav-btn').addEventListener('click', (e) => {
            e.preventDefault();
            const modal = new bootstrap.Modal(document.getElementById("loginModal"));
            modal.show();
        });

        return;
    }

    const params = new URLSearchParams(window.location.search);
    const tituloBuscado = params.get("titulo");

    const btn = document.getElementById("fav-btn");
    const mensaje = document.getElementById("mensaje-favorito");

    try {
        const res = await fetch("http://localhost:3000/api/favoritos/toggle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuarioID: usuario.UsuarioID,
                titulo: tituloBuscado
            })
        });

        const data = await res.json();

        if (data.favorito) {
            btn.innerText = "💔 Quitar de Favoritos";
            btn.classList.replace("btn-outline-primary", "btn-outline-danger");
            mensaje.classList.remove("d-none");
            mensaje.innerText = "Agregado a favoritos.";
        } else {
            btn.innerText = "❤️ Agregar a Favoritos";
            btn.classList.replace("btn-outline-danger", "btn-outline-primary");
            mensaje.classList.remove("d-none");
            mensaje.innerText = "Quitado de favoritos.";
        }
    } catch (err) {
        console.error(err);
        alert("Error al procesar la solicitud.");
    }
}