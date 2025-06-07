document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.UsuarioID) {
        window.location.href = "/index.html";
        return;
    }

    fetch(`http://localhost:3000/api/perfil/${usuario.UsuarioID}`)
        .then(res => res.json())
        .then(data => {
            const { info, stats } = data;

            document.getElementById("perfil-nombre").textContent = info.NombreUsuario;
            document.getElementById("perfil-correo").textContent = `Correo: ${info.Correo}`;
            if (info.FechaCreacion == null) {
                document.getElementById("perfil-fecha-creacion").textContent = `Fecha de creación: No encontrada`;
            } else document.getElementById("perfil-fecha-creacion").textContent = `Fecha de creación: ${new Date(info.FechaCreacion).toLocaleDateString()}`;
            document.getElementById("perfil-stats").textContent = `${stats.CantidadResenas} reseñas • ${stats.CantidadFavoritos} favoritos • ${stats.CantidadVisitas} visitas`;

            renderSeccion("perfil-resenas", data.resenas, templateResena);
            renderSeccion("perfil-favoritos", data.favoritos, templateFavorito);
            renderSeccion("perfil-historial", data.historial, templateHistorial);
        })
        .catch(err => {
            console.error("Error cargando el perfil:" + err);
        });
});

function renderSeccion(id, data, templateFn) {
    const container = document.getElementById(id);
    if (!data.length) {
        container.innerHTML = "<p class='text-muted'>Sin contenido.</p>";
    } else {
        const card = document.createElement("div");
        card.className = "card shadow-sm";
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
        const inner = document.createElement("div");
        inner.className = "container-fluid";

        inner.innerHTML = data.map(templateFn).join("");
        cardBody.appendChild(inner);
        card.appendChild(cardBody);
        container.innerHTML = "";
        container.appendChild(card);
    }
}

function templateResena(resena) {
    const titulo = encodeURIComponent(resena.Titulo);
    return `
    <div class="border rounded p-3 m-3">
      <div class="mb-3">
        <h5 class="card-title">
          <a href="/page.html?titulo=${titulo}" class="text-decoration-none">${resena.Titulo}</a>
          <span class="text-muted">(${new Date(resena.FechaReseña).toLocaleDateString()})</span>
        </h5>
      </div>
      <div>
        <span class="text-muted">${resena.Comentario}</span>
      </div>
    </div>
  `;
}

function templateFavorito(fav) {
    const titulo = encodeURIComponent(fav.Titulo);
    return `
    <div class="border rounded p-3 m-3">
      <h5 class="mb-0">
        <a href="/page.html?titulo=${titulo}" class="text-decoration-none">${fav.Titulo}</a>
      </h5>
      <span class="text-muted">Agregado el ${new Date(fav.FechaAgregado).toLocaleDateString()}</span>
    </div>
  `;
}

function templateHistorial(item) {
    const titulo = encodeURIComponent(item.Titulo);
    return `
    <div class="border rounded p-3 m-3">
      <h6 class="mb-0">
        <a href="/page.html?titulo=${titulo}" class="text-decoration-none">${item.Titulo}</a>
      </h6>
      <span class="text-muted">Visto el ${new Date(item.FechaVisita).toLocaleDateString()}</span>
    </div>
  `;
}