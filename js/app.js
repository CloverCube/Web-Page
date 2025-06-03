frontDate();
pelicula_General();
videojuegos_General();

function frontDate() {
    cargarContenido().then((data) => {
        const contenedor = document.getElementById("Generate");

        data.sort((a, b) => new Date(b.fecha_lanzamiento) - new Date(a.fecha_lanzamiento));

        let html = data.map(createItemHTML).join("");
        contenedor.innerHTML = html;
    });
}
function pelicula_General() {
    cargarContenido().then((data) => {
        console.log(data)
        const contenedor = document.getElementById("peliculas");
        const filtro = data.filter(filtro => filtro.categoria_general === "Peliculas")
        filtro.sort((a, b) => new Date(b.fecha_lanzamiento) - new Date(a.fecha_lanzamiento));
        let html = filtro.map(createItemHTML).join("");
        contenedor.innerHTML = html;
})}

function series_General() {
    cargarContenido().then((data) => {
        console.log(data)
        const contenedor = document.getElementById("series");
        const filtro = data.filter(filtro => filtro.categoria_general === "Series")
        filtro.sort((a, b) => new Date(b.fecha_lanzamiento) - new Date(a.fecha_lanzamiento));
        let html = filtro.map(createItemHTML).join("");
        contenedor.innerHTML = html;
})}

function videojuegos_General() {
    cargarContenido().then((data) => {
        console.log(data)
        const contenedor = document.getElementById("videojuegos");
        const filtro = data.filter(filtro => filtro.categoria_general === "Videojuegos")
        filtro.sort((a, b) => new Date(b.fecha_lanzamiento) - new Date(a.fecha_lanzamiento));
        let html = filtro.map(createItemHTML).join("");
        contenedor.innerHTML = html;
})}

async function cargarContenido() {
    try {
        const resAPI = await fetch("http://localhost:3000/api/contenidos");
        if (!resAPI.ok) throw new Error("API no disponible");
        const contenidosBD = await resAPI.json();

        const resJSON = await fetch("/content/page/content.json");
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
                categoria_general: match?.categoria_general || "",
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
    <div class="row my-4 mx-1" id="articulos">
    <div class="col-12 col-md-3 text-center mb-2">
        <img src="${content.imagen}" alt="${content.Titulo}" class="img-fluid">
    </div>
    <div class="col-md-8">
        <a href="${content.url_page}"><h2>${content.Titulo}</h2></a>
        <p>${content.parrafo}</p>
        <span>Genero: ${content.genero} |</span>
        <span>Likes: ${content.likes} | </span>
        <span>Fecha: ${content.fecha_lanzamiento}</span>
    </div>
    </div>
  `;
}

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const modalElement = document.getElementById('loginModal');
const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);

modal.hide();

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const contrasena = document.getElementById('password').value;

    const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contrasena })
    });

    const data = await res.json();
    if (res.ok) {
        alert(data.message);
        console.log(data.usuario);

        const modal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
        modal.hide();
    } else {
        alert('Error al iniciar sesión');
        console.error(data);
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('emailRegister').value;
    const contrasena = document.getElementById('passwordRegister').value;

    const res = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, contrasena })
    });

    const data = await res.json();
    if (res.ok) {
        alert(data.message);

        const modal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
        modal.hide();
    } else {
        alert('Error al registrarse');
        console.error(data);
    }
});

function mostrarRegistro() {
    loginForm.classList.add('d-none');
    registerForm.classList.remove('d-none');
    document.getElementById('formTitle').innerText = 'Registrarse';
    document.getElementById('switchText').innerHTML = `
        <p>¿Ya tienes cuenta? <a href="#" onclick="mostrarLogin()">Inicia sesión</a></p>
      `;
}

function mostrarLogin() {
    registerForm.classList.add('d-none');
    loginForm.classList.remove('d-none');
    document.getElementById('formTitle').innerText = 'Iniciar Sesión';
    document.getElementById('switchText').innerHTML = `
        <p>¿No tienes cuenta? <a href="#" onclick="mostrarRegistro()">Regístrate</a></p>
      `;
}


