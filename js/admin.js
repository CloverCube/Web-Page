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

            const modal = bootstrap.Modal.getInstance(document.getElementById('modalContenido'));
            modal.hide();
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
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.UsuarioID) {
        alert("Debes de iniciar sesion para ver este apartado.");

        window.location.href = "/index.html";
        return;
    }

    try {
        const res = fetch(`http://localhost:3000/api/perfil/${usuario.UsuarioID}`);
        if (!res.ok) throw new Error('Error al cargar la información');
        const data = res.json();

        const { info, stats, resenas, favoritos, historial } = data;

        if (info.EsAdmin) {
            alert('No eres administrador');

            window.location.href = "/index.html";
            return;
        }
    } catch (error) {
        console.error('Error al verificar administrador:', error);
        alert('Error al verificar administrador');

        window.location.href = "/index.html";
        return;
    }

    const { info, stats, resenas, favoritos, historial } = data;

    mostrarContenidos();

    document.getElementById('btnRecargarUsuarios').addEventListener('click', cargarUsuarios);
    cargarUsuarios();

    document.getElementById('editarUsuarioForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await guardarEdicionUsuario();
    });

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

            fila.innerHTML = `
                <td>${usuario.UsuarioID}</td>
                <td>${usuario.NombreUsuario}</td>
                <td>${usuario.Correo}</td>
                <td>${usuario.EsAdmin}</td>
                <td>${new Date(usuario.FechaRegistro).toLocaleDateString()}</td>
                <td>
                   <button class="btn btn-sm btn-success me-1 btnMas" data-id="${usuario.UsuarioID}">Estadisticas</button>
                   <button class="btn btn-sm btn-primary me-1 btnEditar" data-id="${usuario.UsuarioID}">Editar</button>
                   <button class="btn btn-sm btn-danger btnEliminar" data-id="${usuario.UsuarioID}">Eliminar</button>
                </td>
            `;
            tablaBody.appendChild(fila);
        });

        document.querySelectorAll('.btnEliminar').forEach(btn => {
            btn.addEventListener('click', eliminarUsuario);
        });

        document.querySelectorAll('.btnEditar').forEach(btn => {
            btn.addEventListener('click', mostrarFormularioEdicion);
        });

        document.querySelectorAll('.btnMas').forEach(btn => {
            btn.addEventListener('click', mostrarInfoUsuario);
        });
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        const tablaBody = document.getElementById('tablaUsuarios');
        tablaBody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Error al cargar los usuarios.</td></tr>';
    }
}

async function eliminarUsuario(e) {
    const id = e.target.getAttribute('data-id');
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            alert('Usuario eliminado correctamente.');
            cargarUsuarios();
        } else {
            alert('Error al eliminar usuario.');
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar usuario.');
    }
}

const modalEditarUsuario = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));


async function mostrarFormularioEdicion(e) {
    const id = e.target.getAttribute('data-id');

    try {
        const response = await fetch(`http://localhost:3000/api/perfil/${id}`);
        if (!response.ok) throw new Error('No se encontró el usuario');
        const usuario = await response.json();

        document.getElementById('editUsuarioID').value = usuario.info.UsuarioID;
        document.getElementById('editNombreUsuario').value = usuario.info.NombreUsuario;
        document.getElementById('editCorreo').value = usuario.info.Correo;
        document.getElementById('editRol').value = usuario.info.EsAdmin;

        modalEditarUsuario.show();

    } catch (error) {
        alert('Error al cargar los datos del usuario.');
        console.error(error);
    }
}

function ocultarFormularioEdicion() {
    document.getElementById('formEditarUsuario').style.display = 'none';
}

async function guardarEdicionUsuario() {
    const id = document.getElementById('editUsuarioID').value;
    const nombre = document.getElementById('editNombreUsuario').value.trim();
    const correo = document.getElementById('editCorreo').value.trim();
    const rol = document.getElementById('editRol').value;

    if (!nombre || !correo || !rol) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ NombreUsuario: nombre, Correo: correo, EsAdmin: rol }),
        });

        if (response.ok) {
            alert('Usuario actualizado correctamente.');
            modalEditarUsuario.hide();
            cargarUsuarios();
        } else {
            alert('Error al actualizar el usuario.');
        }
    } catch (error) {
        alert('Error al actualizar el usuario.');
        console.error(error);
    }
}

const modalInfoUsuario = new bootstrap.Modal(document.getElementById('modalInfoUsuario'));

async function mostrarInfoUsuario(e) {
    const usuarioId = e.target.getAttribute('data-id');
    const contenedor = document.getElementById('infoUsuarioContenido');
    contenedor.innerHTML = 'Cargando...';

    try {
        const res = await fetch(`http://localhost:3000/api/perfil/${usuarioId}`);
        if (!res.ok) throw new Error('Error al cargar la información');
        const data = await res.json();

        const { info, stats, resenas, favoritos, historial } = data;

        const html = `
          <h5>Datos Generales</h5>
          <ul>
            <li><strong>ID:</strong> ${info.UsuarioID}</li>
            <li><strong>Nombre:</strong> ${info.NombreUsuario}</li>
            <li><strong>Correo:</strong> ${info.Correo}</li>
            <li><strong>Fecha Registro:</strong> ${new Date(info.FechaRegistro).toLocaleDateString()}</li>
            <li><strong>Es Admin:</strong> ${info.EsAdmin ? 'Sí' : 'No'}</li>
          </ul>

          <h5>Estadísticas</h5>
          <ul>
            <li><strong>Reseñas:</strong> ${stats.CantidadResenas}</li>
            <li><strong>Favoritos:</strong> ${stats.CantidadFavoritos}</li>
            <li><strong>Visitas:</strong> ${stats.CantidadVisitas}</li>
          </ul>

          <h5>Reseñas Recientes</h5>
          ${resenas.length === 0 ? '<p>No hay reseñas.</p>' : `
            <ul>
              ${resenas.map(r => `
                <li><strong>${r.Titulo}</strong> - Calificación: ${r.Calificacion} - Fecha: ${new Date(r.FechaReseña).toLocaleDateString()}<br>
                Comentario: ${r.Comentario}</li>
              `).join('')}
            </ul>
          `}

          <h5>Favoritos</h5>
          ${favoritos.length === 0 ? '<p>No hay favoritos.</p>' : `
            <ul>
              ${favoritos.map(f => `
                <li><strong>${f.Titulo}</strong> - Agregado: ${new Date(f.FechaAgregado).toLocaleDateString()}</li>
              `).join('')}
            </ul>
          `}

          <h5>Historial de Visitas</h5>
          ${historial.length === 0 ? '<p>No hay historial.</p>' : `
            <ul>
              ${historial.map(h => `
                <li><strong>${h.Titulo}</strong> - Visitado: ${new Date(h.FechaVisita).toLocaleDateString()}</li>
              `).join('')}
            </ul>
          `}
        `;

        contenedor.innerHTML = html;
        modalInfoUsuario.show();

    } catch (error) {
        contenedor.innerHTML = '<p class="text-danger">Error al cargar la información.</p>';
        console.error(error);
        modalInfoUsuario.show();
    }
}