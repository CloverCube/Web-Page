const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());

const dbConfig = {
    user: 'PixelUser',
    password: 'Hola123!Segura',
    server: 'localhost',
    database: 'PixelFrame',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

app.get("/api/contenidos", async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query(`
            SELECT
                c.ContenidoID AS id,
                c.Titulo,
                c.Descripcion,
                c.FechaLanzamiento AS fecha_lanzamiento,
                tc.NombreTipo AS tipo,
                g.NombreGenero AS genero,
                c.Likes
            FROM Contenidos c
                     JOIN TiposContenido tc ON c.TipoID = tc.TipoID
                     JOIN Generos g ON c.GeneroID = g.GeneroID
            ORDER BY c.Likes DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error al consultar SQL Server:", err);
        res.status(500).send("Error en base de datos");
    }
});

app.use(express.json());

const jwt = require("jsonwebtoken");
const JWT_SECRET = "esto_es_una_clave_jwt_para_guardar_login";

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

app.post("/api/register", async (req, res) => {
    const { nombre, email, contrasena } = req.body;

    try {
        await sql.connect(dbConfig);
        const checkEmail = await sql.query`SELECT * FROM Usuarios WHERE Correo = ${email}`;

        if (checkEmail.recordset.length > 0) {
            return res.status(400).json({ message: "Correo ya registrado" });
        }

        await sql.query`
            INSERT INTO Usuarios (NombreUsuario, Correo, Contrasena)
            VALUES (${nombre}, ${email}, ${contrasena})
        `;

        const result = await sql.query`
            SELECT * FROM Usuarios WHERE Correo = ${email} AND Contrasena = ${contrasena}
        `;

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const usuario = result.recordset[0];

        const token = jwt.sign(
            {
                usuarioId: usuario.UsuarioID,
                nombre: usuario.NombreUsuario,
                email: usuario.Correo
            },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({ message: "Registro exitoso", token, usuario: {
                UsuarioID: usuario.UsuarioID,
                NombreUsuario: usuario.NombreUsuario,
                Correo: usuario.Correo
            }});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error en servidor" });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, contrasena } = req.body;

    try {
        await sql.connect(dbConfig);
        const result = await sql.query`
            SELECT * FROM Usuarios WHERE Correo = ${email} AND Contrasena = ${contrasena}
        `;

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const usuario = result.recordset[0];

        const token = jwt.sign(
            {
                usuarioId: usuario.UsuarioID,
                nombre: usuario.NombreUsuario,
                email: usuario.Correo
            },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({ message: "Inicio de sesión exitoso", token, usuario: {
                UsuarioID: usuario.UsuarioID,
                NombreUsuario: usuario.NombreUsuario,
                Correo: usuario.Correo
            }});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error en servidor" });
    }
});

app.post('/api/resenas', async (req, res) => {
    const { usuarioId, titulo, calificacion, comentario } = req.body;

    try {
        await sql.connect(dbConfig);

        const result = await sql.query`
            SELECT ContenidoID FROM Contenidos WHERE Titulo = ${titulo}
        `;
        if (result.recordset.length === 0) {
            return res.status(404).send('Contenido no encontrado');
        }

        const contenidoId = result.recordset[0].ContenidoID;

        await sql.query`
            INSERT INTO Resenas (UsuarioID, ContenidoID, Calificacion, Comentario)
            VALUES (${usuarioId}, ${contenidoId}, ${calificacion}, ${comentario});
        `;

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/resenas/titulo/:titulo', async (req, res) => {
    const { titulo } = req.params;

    try {
        await sql.connect(dbConfig);
        const result = await sql.query`
            SELECT R.ReseñaID, U.NombreUsuario, R.Calificacion, R.Comentario, R.FechaReseña, C.Titulo
                FROM Resenas R
                     JOIN Usuarios U ON R.UsuarioID = U.UsuarioID
                     JOIN Contenidos C ON R.ContenidoID = C.ContenidoID
                WHERE C.Titulo = ${titulo}
                    ORDER BY R.FechaReseña DESC;
        `;

        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(port, () => {
    console.log(`Servidor API escuchando en http://localhost:${port}`);
});

setInterval(() => {}, 1000);
