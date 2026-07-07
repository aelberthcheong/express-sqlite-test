Berikut jawaban sesuai yang diminta pada soal.

---

# 1. Model Sequelize dan Route Express

### Model `Item.js`

```javascript
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Item = sequelize.define("Item", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bought: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Item;
```

### Route `POST /api/items`

```javascript
const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

router.post("/api/items", async (req, res) => {
  try {
    const item = await Item.create({
      name: req.body.name
    });

    res.status(201).json({
      success: true,
      message: "Item berhasil ditambahkan",
      data: item
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
```

---

# 2. Middleware Otorisasi Admin

```javascript
const express = require("express");
const router = express.Router();

function checkAdminRole(req, res, next) {
  if (req.user && req.user.role === "ADMIN") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Akses ditolak: Hak akses Admin diperlukan."
  });
}

router.delete("/api/posts/:id", checkAdminRole, (req, res) => {
  res.json({
    success: true,
    message: "Postingan berhasil dihapus."
  });
});

module.exports = router;
```

---

# 3. Socket.IO Lelang Online

```javascript
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("place_bid", (data) => {
    io.emit("bid_updated", {
      ...data,
      timestamp: new Date()
    });
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

---

# 4. API Quotes dan Halaman Quotes

## Koneksi Database

```javascript
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

module.exports = db;
```

## Endpoint API `/api/quotes`

```javascript
const express = require("express");
const router = express.Router();
const db = require("../config/database");

router.get("/api/quotes", async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM quotes ORDER BY RAND() LIMIT 9"
  );

  res.json(rows);
});

module.exports = router;
```

## Endpoint `/quotes`

```javascript
router.get("/quotes", async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM quotes ORDER BY RAND() LIMIT 9"
  );

  res.render("quotes", {
    quotes: rows
  });
});
```

> Koneksi database menggunakan environment variable (`process.env.DB_HOST`, `process.env.DB_USER`, `process.env.DB_PASSWORD`, `process.env.DB_NAME`) sehingga dapat dijalankan pada hosting seperti Railway.