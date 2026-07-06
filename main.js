import express from "express";
import swaggerSpec from "./docs/openapi.json" with { type: "json" }
import swaggerUi from "swagger-ui-express";
import { nanoid } from "nanoid";
import { DatabaseSync } from "node:sqlite";

class ClientError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }

    static badRequest(message="Bad Request") {
        return new ClientError(message, 400);
    }

    static notFound(message="Not Found") {
        return new ClientError(message, 404);
    }
}

const db = new DatabaseSync("data.db");
const routes = express.Router();

function validateParamsId(req, res, next) {
    if (!req.params.id) 
        throw ClientError.badRequest();
    next();
}

function doesAuthorExist(authorName) {
    const row = db.prepare(`SELECT id FROM authors WHERE name LIKE ?`)
                  .get(authorName);

    return row !== undefined;
}

routes.get("/quotes", function (req, res) {
    const rows = db.prepare(
        `SELECT quotes.id AS id, quotes.text AS text, authors.name AS author
         FROM quotes
         INNER JOIN authors ON quotes.author_id = authors.id
        `
    ).all();

    if (!rows.length)
        throw ClientError.notFound();

    res.status(200).json({
        message: "Berhasil menampilkan quote(s).",
        data: { rows }
    })
});

routes.get("/quotes/:id", validateParamsId, function (req, res) {
    const row = db.prepare(
        `SELECT quotes.id AS id, quotes.text AS text, authors.name AS author
         FROM quotes
         INNER JOIN authors ON quotes.author_id = authors.id
         WHERE quotes.id = ?
        `
    ).get(req.params.id);

    if (!row)
        throw ClientError.notFound();

    res.status(200).json({
        message: "Berhasil menampilkan quote.",
        data: { row }
    })
});

routes.put("/quotes/:id", validateParamsId, function (req, res) {
    const {
        authorId: author_id,
        text, 
    } = req.body;

    if (!author_id || !text)
        throw ClientError.badRequest();

    db.prepare(`UPDATE quotes SET author_id = ?, text = ? WHERE id = ?`)
      .run(author_id, text, req.params.id);
    
    res.status(201).json({
        message: "Berhasil menperbarui quote.",
    });
});

routes.post("/quotes", function (req, res) {
    const {
        authorId: author_id,
        text, 
    } = req.body;

    if (!author_id || !text)
        throw ClientError.badRequest();

    const id = `quote-${nanoid()}`;
    db.prepare(`INSERT INTO quotes VALUES (?, ?, ?)`)
      .run(id, author_id, text);
    
    res.status(201).json({
        message: "Berhasil menambahkan quote.",
        data: { id },
    });
});

routes.delete("/quotes/:id", validateParamsId, function (req, res) {
    const { changes } = db.prepare("DELETE FROM quotes WHERE id = ?")
                          .run(req.params.id);

    if (!changes)
        throw ClientError.notFound();

    res.status(200).json({
        message: "Berhasil menghapuskan quote.",
    });
});

routes.get("/authors", function (req, res) {
    const rows = db.prepare(`SELECT * FROM authors`)
                   .all();

    if (!rows.length)
        throw ClientError.notFound();

    res.status(200).json({
        message: "Berhasil menampilkan author(s).",
        data: { rows },
    })
});

routes.post("/authors", function (req, res) {
    const { name } = req.body;

    if (!name)
        throw ClientError.badRequest();

    if (doesAuthorExist(name))
        throw ClientError.badRequest("Username exists");

    const id = `author-${nanoid()}`;
    db.prepare(`INSERT INTO authors VALUES (?, ?)`)
      .run(id, name);

    res.status(201).json({
        message: "Berhasil menambahkan author.",
        data: { id },
    });
});

routes.delete("/authors/:id", validateParamsId, function (req, res) {
    const { changes } = db.prepare("DELETE FROM authors WHERE id = ?")
                          .run(req.params.id);

    if (!changes)
        throw ClientError.notFound();

    res.status(200).json({
        message: "Berhasil menghapuskan author.",
    });
});

function main() {
    const host = "127.0.0.1";
    const port = 8080;
    const app  = express();

    app.use(express.json());
    app.use("/api", routes);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use(function (err, req, res, next) {
        if (err instanceof ClientError) {
            res.status(err.status).json({
                message: `${err.message} :<`
            });
            return;
        }

        console.error(err);

        res.status(err.status || 500).json({
            message: `Internal Server Error :(`
        });
    });

    app.listen(port, host, () => {
        console.log(`\n  Server running on [http://${host}:${port}]`);
        console.log(`  Press <Ctrl+C> to stop the server\n`)
    });
}

if (import.meta.main) {
    main();
}