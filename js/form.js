document.getElementById("formularioRegistro").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombreRegistro").value;
    const email = document.getElementById("emailRegistro").value;
    const password = document.getElementById("passwordRegistro").value;

    try {
        const res = await fetch("http://localhost:3000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, contrasena: password }),
        });

        const data = await res.json();
        alert(data.message);

        if (res.ok) {
            const usuario = data.usuario;
            document.getElementById('loginResultado').innerText =
                `Has iniciado sesión como ${usuario.NombreUsuario}, correo: ${usuario.Correo}`;
        } else {
            document.getElementById('loginResultado').innerText = data.message;

            document.getElementById("loginResultado").reset();
        }
    } catch (err) {
        alert("Error en el registro");
        console.error(err);
    }
});

document.getElementById("formularioLogin").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("emailLogin").value;
    const password = document.getElementById("passwordLogin").value;

    try {
        const res = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, contrasena: password }),
        });

        const data = await res.json();
        alert(data.message);

        console.log(data);

        if (res.ok) {
            const usuario = data.usuario;
            document.getElementById('loginResultado').innerText =
                `Has iniciado sesión como ${usuario.NombreUsuario}, correo: ${usuario.Correo}`;
        } else {
            document.getElementById('loginResultado').innerText = data.message;
        }
    } catch (err) {
        alert("Error en el inicio de sesión");
        console.error(err);
    }
});