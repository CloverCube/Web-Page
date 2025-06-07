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

app.get('/api/perfil/:usuarioId', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const usuarioId = req.params.usuarioId;

        const [resenas, favoritos, historial] = await Promise.all([
            pool.request()
                .input('UsuarioID', sql.Int, usuarioId)
                .query(`
                    SELECT R.ReseñaID, R.Calificacion, R.Comentario, R.FechaReseña, C.Titulo
                    FROM Resenas R
                        JOIN Contenidos C ON R.ContenidoID = C.ContenidoID
                    WHERE R.UsuarioID = @UsuarioID
                    ORDER BY R.FechaReseña DESC
                `),
            pool.request()
                .input('UsuarioID', sql.Int, usuarioId)
                .query(`
                    SELECT F.FavoritoID, F.FechaAgregado, C.Titulo
                    FROM Favoritos F
                        JOIN Contenidos C ON F.ContenidoID = C.ContenidoID
                    WHERE F.UsuarioID = @UsuarioID
                    ORDER BY F.FechaAgregado DESC
                `),
            pool.request()
                .input('UsuarioID', sql.Int, usuarioId)
                .query(`
                    SELECT H.HistorialID, H.FechaVisita, C.Titulo
                    FROM HistorialPaginas H
                        JOIN Contenidos C ON H.ContenidoID = C.ContenidoID
                    WHERE H.UsuarioID = @UsuarioID
                    ORDER BY H.FechaVisita DESC
                `)
            ]
        );

        const usuarioInfo = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .query(`
                SELECT UsuarioID, NombreUsuario, Correo, FechaRegistro, EsAdmin
                FROM Usuarios
                WHERE UsuarioID = @UsuarioID
            `);

        const estadisticas = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .query(`
                SELECT
                    (SELECT COUNT(*) FROM Resenas WHERE UsuarioID = @UsuarioID) AS CantidadResenas,
                    (SELECT COUNT(*) FROM Favoritos WHERE UsuarioID = @UsuarioID) AS CantidadFavoritos,
                    (SELECT COUNT(*) FROM HistorialPaginas WHERE UsuarioID = @UsuarioID) AS CantidadVisitas
            `);

        res.json({
            info: usuarioInfo.recordset[0],
            stats: estadisticas.recordset[0],
            resenas: resenas.recordset,
            favoritos: favoritos.recordset,
            historial: historial.recordset
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al cargar perfil' });
    }
});

app.get("/api/favoritos", async (req, res) => {
    const { usuarioID, titulo } = req.query; // <-- AQUÍ

    if (!usuarioID || !titulo) {
        return res.status(400).json({ error: "Datos incompletos." });
    }

    try {
        const pool = await sql.connect(dbConfig);

        const result = await pool.request()
            .input("titulo", sql.NVarChar, titulo)
            .query(`SELECT ContenidoID FROM Contenidos WHERE Titulo = @titulo`);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Contenido no encontrado." });
        }

        const contenidoID = result.recordset[0].ContenidoID;

        const favCheck = await pool.request()
            .input("usuarioID", sql.Int, usuarioID)
            .input("contenidoID", sql.Int, contenidoID)
            .query(`
                SELECT * FROM Favoritos
                WHERE UsuarioID = @usuarioID AND ContenidoID = @contenidoID
            `);

        return res.json({ favorito: favCheck.recordset.length > 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

app.post("/api/favoritos/toggle", async (req, res) => {
    const { usuarioID, titulo } = req.body;

    if (!usuarioID || !titulo) {
        return res.status(400).json({ error: "Datos incompletos." });
    }

    try {
        const pool = await sql.connect(dbConfig);

        const result = await pool.request()
            .input("titulo", sql.NVarChar, titulo)
            .query(`SELECT ContenidoID FROM Contenidos WHERE Titulo = @titulo`);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Contenido no encontrado." });
        }

        const contenidoID = result.recordset[0].ContenidoID;

        const favCheck = await pool.request()
            .input("usuarioID", sql.Int, usuarioID)
            .input("contenidoID", sql.Int, contenidoID)
            .query(`
                SELECT * FROM Favoritos
                WHERE UsuarioID = @usuarioID AND ContenidoID = @contenidoID
            `);

        if (favCheck.recordset.length > 0) {
            await pool.request()
                .input("usuarioID", sql.Int, usuarioID)
                .input("contenidoID", sql.Int, contenidoID)
                .query(`
                    DELETE FROM Favoritos
                    WHERE UsuarioID = @usuarioID AND ContenidoID = @contenidoID
                `);

            return res.json({ favorito: false });
        } else {
            await pool.request()
                .input("usuarioID", sql.Int, usuarioID)
                .input("contenidoID", sql.Int, contenidoID)
                .query(`
                    INSERT INTO Favoritos (UsuarioID, ContenidoID, FechaAgregado)
                    VALUES (@usuarioID, @contenidoID, GETDATE())
                `);

            return res.json({ favorito: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

app.post("/api/historial/insert", async (req, res) => {
    const { usuarioID, titulo } = req.body;

    if (!usuarioID || !titulo) {
        return res.status(400).json({ error: "Datos incompletos." });
    }

    try {
        const pool = await sql.connect(dbConfig);

        const result = await pool.request()
            .input("titulo", sql.NVarChar, titulo)
            .query(`SELECT ContenidoID FROM Contenidos WHERE Titulo = @titulo`);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Contenido no encontrado." });
        }

        const contenidoID = result.recordset[0].ContenidoID;

        await pool.request()
            .input("usuarioID", sql.Int, usuarioID)
            .input("contenidoID", sql.Int, contenidoID)
            .query(`
                INSERT INTO HistorialPaginas (UsuarioID, ContenidoID, FechaVisita)
                VALUES (@usuarioID, @contenidoID, GETDATE())
            `);

        return res.json({ success: true });
    } catch (err) {
        console.error("Error al insertar historial:", err);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

app.listen(port, () => {
    console.log(`Servidor API escuchando en http://localhost:${port}`);
});

setInterval(() => {}, 1000);
