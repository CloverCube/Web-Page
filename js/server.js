const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const fs = require("fs").promises;

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

app.get("/api/contenidos/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const pool = await sql.connect(dbConfig);

        const result = await pool.request()
            .input("id", sql.Int, id)
            .query(`
                SELECT c.ContenidoID, c.Titulo, c.Descripcion, c.TipoID, c.GeneroID,
                       c.FechaLanzamiento, c.Likes
                FROM Contenidos c
                WHERE c.ContenidoID = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Contenido no encontrado" });
        }

        const contenidoBD = result.recordset[0];

        const contentPath = "../content/page/content.json";
        const subContentPath = "../content/page/subpage_content.json";
        const subContentJSON = JSON.parse(await fs.readFile(subContentPath, "utf8"));

        const contentJSON = JSON.parse(await fs.readFile(contentPath, "utf-8"));

        const contentMatch = contentJSON.find(item => item.titulo.toLowerCase() === contenidoBD.Titulo.toLowerCase());
        const subMatch = subContentJSON.find(item => item.titulo.toLowerCase() === contenidoBD.Titulo.toLowerCase());

        res.json({
            ...contenidoBD,
            imagen: contentMatch?.imagen || "",
            titulo_second: subMatch?.titulo_second || "",
            content_second: subMatch?.content_second || "",
            titulo_three: subMatch?.titulo_three || "",
            content_three: subMatch?.content_three || "",
            titulo_four: subMatch?.titulo_four || "",
            content_four: subMatch?.content_four || ""
        });

    } catch (err) {
        console.error("Error obteniendo contenido:", err);
        res.status(500).json({ error: "Error interno del servidor" });
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

app.post("/api/contenidos/nuevo", async (req, res) => {
    const {
        titulo, descripcion, tipoID, generoID, fechaLanzamiento, imagenURL,
        PuntoUno, ContenidoPuntoUno,
        PuntoDos, ContenidoPuntoDos,
        PuntoTres, ContenidoPuntoTres
    } = req.body;

    if (!titulo || !descripcion || !tipoID || !generoID || !fechaLanzamiento) {
        return res.status(400).json({ error: "Datos incompletos" });
    }

    try {
        const contentPath = "../content/page/content.json";
        const contentData = JSON.parse(await fs.readFile(contentPath, "utf8"));
        contentData.push({ titulo, imagen: imagenURL });
        await fs.writeFile(contentPath, JSON.stringify(contentData, null, 2));

        const subContentPath = "../content/page/subpage_content.json";
        const subContentData = JSON.parse(await fs.readFile(subContentPath, "utf8"));
        subContentData.push({
            titulo,
            titulo_second: PuntoUno,
            content_second: ContenidoPuntoUno,
            titulo_three: PuntoDos,
            content_three: ContenidoPuntoDos,
            titulo_four: PuntoTres,
            content_four: ContenidoPuntoTres
        });
        await fs.writeFile(subContentPath, JSON.stringify(subContentData, null, 2));

        const pool = await sql.connect(dbConfig);

        const check = await pool.request()
            .input("titulo", sql.NVarChar, titulo)
            .query("SELECT COUNT(*) as total FROM Contenidos WHERE Titulo = @titulo");

        if (check.recordset[0].total > 0) {
            return res.status(409).json({ error: "Este título ya existe en la base de datos." });
        }

        await pool.request()
            .input("titulo", sql.NVarChar, titulo)
            .input("descripcion", sql.NVarChar, descripcion)
            .input("tipoID", sql.Int, tipoID)
            .input("generoID", sql.Int, generoID)
            .input("fecha", sql.Date, fechaLanzamiento)
            .query(`
                INSERT INTO Contenidos (Titulo, Descripcion, TipoID, GeneroID, FechaLanzamiento, Likes)
                VALUES (@titulo, @descripcion, @tipoID, @generoID, @fecha, 0)
            `);

        res.json({ mensaje: "Contenido creado con éxito." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al guardar contenido." });
    }
});

app.put("/api/contenidos/editar/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    const {
        titulo, descripcion, tipoID, generoID, fecha_lanzamiento,
        imagen,
        titulo_second, content_second,
        titulo_three, content_three,
        titulo_four, content_four
    } = req.body;

    if (!titulo || !descripcion || !fecha_lanzamiento) {
        return res.status(400).json({ error: "Datos incompletos" });
    }

    try {
        const pool = await sql.connect(dbConfig);

        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("SELECT Titulo FROM Contenidos WHERE ContenidoID = @id");

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Contenido no encontrado" });
        }

        const tituloAnterior = result.recordset[0].Titulo;

        await pool.request()
            .input("id", sql.Int, id)
            .input("titulo", sql.NVarChar, titulo)
            .input("descripcion", sql.NVarChar, descripcion)
            .input("tipoID", sql.Int, tipoID)
            .input("generoID", sql.Int, generoID)
            .input("fecha", sql.Date, fecha_lanzamiento)
            .query(`
                UPDATE Contenidos
                SET Titulo = @titulo,
                    Descripcion = @descripcion,
                    TipoID = @tipoID,
                    GeneroID = @generoID,
                    FechaLanzamiento = @fecha
                WHERE ContenidoID = @id
            `);

        const contentPath = "../content/page/content.json";
        const subPath = "../content/page/subpage_content.json";

        const contentData = JSON.parse(await fs.readFile(contentPath, "utf8"));
        const nuevoContentData = contentData.filter(c => c.titulo.toLowerCase() !== tituloAnterior.toLowerCase());
        nuevoContentData.push({ titulo, imagen });
        await fs.writeFile(contentPath, JSON.stringify(nuevoContentData, null, 2));

        const subData = JSON.parse(await fs.readFile(subPath, "utf8"));
        const nuevoSubData = subData.filter(c => c.titulo.toLowerCase() !== tituloAnterior.toLowerCase());
        nuevoSubData.push({
            titulo,
            titulo_second,
            content_second,
            titulo_three,
            content_three,
            titulo_four,
            content_four
        });
        await fs.writeFile(subPath, JSON.stringify(nuevoSubData, null, 2));

        res.json({ mensaje: "Contenido actualizado correctamente." });

    } catch (err) {
        console.error("Error al actualizar contenido:", err);
        res.status(500).json({ error: "Error al actualizar el contenido." });
    }
});

app.delete('/api/contenidos/eliminar/:id', async (req, res) => {
    const contenidoId = parseInt(req.params.id);

    if (!contenidoId || isNaN(contenidoId)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const pool = await sql.connect(dbConfig);

        const resultSelect = await pool.request()
            .input('id', sql.Int, contenidoId)
            .query('SELECT Titulo FROM Contenidos WHERE ContenidoID = @id');

        if (resultSelect.recordset.length === 0) {
            return res.status(404).json({ error: 'Contenido no encontrado' });
        }

        const titulo = resultSelect.recordset[0].Titulo;

        await pool.request()
            .input('id', sql.Int, contenidoId)
            .query('DELETE FROM Resenas WHERE ContenidoID = @id');

        await pool.request()
            .input('id', sql.Int, contenidoId)
            .query('DELETE FROM Favoritos WHERE ContenidoID = @id');

        await pool.request()
            .input('id', sql.Int, contenidoId)
            .query('DELETE FROM HistorialPaginas WHERE ContenidoID = @id');

        await pool.request()
            .input('id', sql.Int, contenidoId)
            .query('DELETE FROM Contenidos WHERE ContenidoID = @id');

        const contentPath = '../content/page/content.json';
        const contentData = JSON.parse(await fs.readFile(contentPath, "utf8"));
        const newContentData = contentData.filter(c => c.titulo.toLowerCase() !== titulo.toLowerCase());
        await fs.writeFile(contentPath, JSON.stringify(newContentData, null, 2));

        const subPath = '../content/page/subpage_content.json';
        const subData = JSON.parse(await fs.readFile(subPath, "utf8"));
        const newSubData = subData.filter(c => c.titulo.toLowerCase() !== titulo.toLowerCase());
        await fs.writeFile(subPath, JSON.stringify(newSubData, null, 2));

        res.status(200).json({ message: 'Contenido y datos relacionados eliminados correctamente' });
    } catch (error) {
        console.error('Error al eliminar contenido:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.listen(port, () => {
    console.log(`Servidor API escuchando en http://localhost:${port}`);
});

setInterval(() => {}, 1000);
