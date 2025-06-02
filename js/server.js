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
                g.NombreGenero AS genero
            FROM Contenidos c
                     JOIN TiposContenido tc ON c.TipoID = tc.TipoID
                     JOIN Generos g ON c.GeneroID = g.GeneroID
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error al consultar SQL Server:", err);
        res.status(500).send("Error en base de datos");
    }
});

app.use(express.json());

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

        res.json({ message: "Registro exitoso" });
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

        res.json({ message: "Inicio de sesión exitoso", usuario: result.recordset[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error en servidor" });
    }
});

app.listen(port, () => {
    console.log(`Servidor API escuchando en http://localhost:${port}`);
});

setInterval(() => {}, 1000);
