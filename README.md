# Web-Page

## Update submodule

```sh
    git submodule init
    git submodule update --recursive --remote
``` 

## Add Submodule (example)

```sh
    cd content
    git pull origin release
    cd ..
    git add content
    git commit -m "Submodule Updated"
``` 

## Install node-server (Connect to DataBase)

```sh
    npm init -y
    npm install express mssql cors jsonwebtoken
``` 


## Example for to use auth.js and system login

Hacer consultas protegidas al server.js backed:
```js
    const token = localStorage.getItem("token");

    fetch("http://localhost:3000/api/contenidos", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }
    ).then(res => res.json())
    .then(data => {
        // mostrar contenido
    });
```

Proteger una consulta desde el backend server.js:

```js
    const jwt = require("jsonwebtoken");

    // Funcion para proteger rutas
    function autenticarToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];

        if (!token) return res.status(401).json({ message: "Token no proporcionado" });

        jwt.verify(token, JWT_SECRET, (err, usuario) => {
            if (err) return res.status(403).json({ message: "Token inválido" });
            req.usuario = usuario;
            next();
        });
    }

    // Usar el middleware en rutas protegidas:
    app.get("/api/contenidos", autenticarToken, async (req, res) => {
        // ...
    });
```

Proteger acciones

```js
    //function for protect action
    function usuarioAutenticado() {
        const token = localStorage.getItem("token");
        return token !== null;
    }
```

Incluir sitios protegidos y que sea requerido iniciar sesion:

```html
    <script src="/js/auth.js"></script>
```