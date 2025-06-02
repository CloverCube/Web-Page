const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

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
    } else {
        alert(data.message || 'Error al iniciar sesión');
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
        mostrarLogin();
    } else {
        alert(data.message || 'Error al registrarse');
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