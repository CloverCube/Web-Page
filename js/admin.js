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

        await mostrarContenidos();
    } catch (error) {
        console.error("Error al guardar contenido:", error);
        alert("Error al guardar contenido.");
    }
});

async function mostrarContenidos() {
    const lista = await cargarContenido();
    const container = document.getElementById("Content-Admin");
    container.innerHTML = "";

    lista.forEach(item => {
        const col = document.createElement("div");
        col.className = "col-md-6";

        col.innerHTML = `
            <div class="card h-100 shadow-sm">
                <img src="${item.imagen}" class="card-img-top" alt="${item.Titulo}" style="max-height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${item.Titulo}</h5>
                    <p class="card-text">${item.parrafo.slice(0, 100)}...</p>
                    <p class="text-muted mb-1">Lanzamiento: ${item.fecha_lanzamiento}</p>
                    <p class="text-muted mb-3">Tipo: ${item.tipo} • Género: ${item.categoria_general}</p>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="abrirModalEditar(${item.id})">Editar</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarContenido(${item.id})">Eliminar</button>
                </div>
            </div>
        `;

        container.appendChild(col);
    });
}

async function abrirModalEditar(id) {
    try {
        const res = await fetch(`http://localhost:3000/api/contenidos/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener el contenido");

        const data = await res.json();

        document.getElementById("editContenidoID").value = data.ContenidoID;
        document.getElementById("editTitulo").value = data.Titulo;
        document.getElementById("editDescripcion").value = data.Descripcion;
        document.getElementById("editTipoID").value = data.TipoID;
        document.getElementById("editGeneroID").value = data.GeneroID;
        document.getElementById("editFechaLanzamiento").value = data.FechaLanzamiento.split("T")[0];
        document.getElementById("editImagen").value = data.imagen || "";

        document.getElementById("editTituloSecond").value = data.titulo_second || "";
        document.getElementById("editContentSecond").value = data.content_second || "";
        document.getElementById("editTituloThree").value = data.titulo_three || "";
        document.getElementById("editContentThree").value = data.content_three || "";
        document.getElementById("editTituloFour").value = data.titulo_four || "";
        document.getElementById("editContentFour").value = data.content_four || "";

        new bootstrap.Modal(document.getElementById("editarModal")).show();
    } catch (err) {
        console.error("Error cargando contenido:", err);
        alert("No se pudo cargar el contenido para edición.");
    }
}

document.getElementById("formEditarContenido").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editContenidoID").value;

    const datos = {
        titulo: document.getElementById("editTitulo").value.trim(),
        descripcion: document.getElementById("editDescripcion").value.trim(),
        tipoID: parseInt(document.getElementById("editTipoID").value),
        generoID: parseInt(document.getElementById("editGeneroID").value),
        fecha_lanzamiento: document.getElementById("editFechaLanzamiento").value,
        imagen: document.getElementById("editImagen").value.trim(),
        titulo_second: document.getElementById("editTituloSecond").value.trim(),
        content_second: document.getElementById("editContentSecond").value.trim(),
        titulo_three: document.getElementById("editTituloThree").value.trim(),
        content_three: document.getElementById("editContentThree").value.trim(),
        titulo_four: document.getElementById("editTituloFour").value.trim(),
        content_four: document.getElementById("editContentFour").value.trim()
    };

    try {
        const res = await fetch(`http://localhost:3000/api/contenidos/editar/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (!res.ok) {
            console.log(res);

            throw new Error("Error al guardar");
        }

        const result = await res.json();
        alert(result.mensaje || "Contenido actualizado");

        await mostrarContenidos();

        const modal = bootstrap.Modal.getInstance(document.getElementById("editarModal"));
        modal.hide();
    } catch (err) {
        console.error(err);
        alert("Error al actualizar el contenido.");
    }
});

async function eliminarContenido(id) {
    if (!confirm("¿Estás seguro de eliminar este contenido?")) return;

    try {
        const res = await fetch(`http://localhost:3000/api/contenidos/eliminar/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) throw new Error("Error al eliminar");
        await mostrarContenidos();
    } catch (err) {
        console.error(err);
        alert("No se pudo eliminar el contenido");
    }
}

const btnAgregar = document.getElementById('btnAgregar');
const formulario = document.getElementById('formularios-estilos');

btnAgregar.addEventListener('click', () => {
    if (formulario.style.display === 'none' || formulario.style.display === '') {
        formulario.style.display = 'block';
        btnAgregar.textContent = 'Cerrar formulario';
    } else {
        formulario.style.display = 'none';
        btnAgregar.textContent = 'Agregar';
    }
});

async function cargarSelect(url, selectId, placeholder) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error al cargar datos');
        const data = await res.json();
        const select = document.getElementById(selectId);

        select.innerHTML = '';

        const optionPlaceholder = document.createElement('option');
        optionPlaceholder.value = '';
        optionPlaceholder.textContent = placeholder;
        optionPlaceholder.disabled = true;
        optionPlaceholder.selected = true;
        select.appendChild(optionPlaceholder);

        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[Object.keys(item)[0]];
            option.textContent = item.NombreGenero || item.NombreTipo || "Valor desconocido.";
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando select:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    mostrarContenidos();

    document.getElementById('btnRecargarUsuarios').addEventListener('click', cargarUsuarios);
    cargarUsuarios();

    cargarSelect('http://localhost:3000/api/tipos', 'tipoID', 'Seleccionar tipo...');
    cargarSelect('http://localhost:3000/api/generos', 'generoID', 'Seleccionar género...');
    cargarSelect('http://localhost:3000/api/tipos', 'editTipoID', 'Seleccionar tipo...');
    cargarSelect('http://localhost:3000/api/generos', 'editGeneroID', 'Seleccionar género...');
});

async function cargarUsuarios() {
    try {
        const response = await fetch('http://localhost:3000/api/usuarios');
        const usuarios = await response.json();

        const tablaBody = document.getElementById('tablaUsuarios');
        tablaBody.innerHTML = '';

        if (usuarios.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay usuarios registrados.</td></tr>';
            return;
        }

        usuarios.forEach(usuario => {
            const fila = document.createElement('tr');

            let rol = "Usuario";

            if (usuario.EsAdmin) {
                rol = "Administrador";
            }

            fila.innerHTML = `
                <td>${usuario.UsuarioID}</td>
                <td>${usuario.NombreUsuario}</td>
                <td>${usuario.Correo}</td>
                <td>${rol}</td>
                <td>${new Date(usuario.FechaRegistro).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-1">Editar</button>
                    <button class="btn btn-sm btn-danger">Eliminar</button>
                </td>
            `;
            tablaBody.appendChild(fila);
        });

    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        const tablaBody = document.getElementById('tablaUsuarios');
        tablaBody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Error al cargar los usuarios.</td></tr>';
    }
}