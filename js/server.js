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

app.listen(port, () => {
    console.log(`Servidor API escuchando en http://localhost:${port}`);
});
