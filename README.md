

# 🧠 Bookmark Manager API Documentation

A minimal but scalable **Bookmark Management API** powered by:

---

## 🧰 Tech Stack

| Tool                                                      | Purpose                            |
| --------------------------------------------------------- | ---------------------------------- |
| **[Bun](https://bun.sh)**                                 | Fast all-in-one JavaScript runtime |
| **[Elysia.js](https://elysiajs.com/)**                    | Lightweight web framework for Bun  |
| **[Drizzle ORM](https://orm.drizzle.team/)**              | Typesafe SQL ORM                   |
| **[Drizzle Kit](https://orm.drizzle.team/docs/overview)** | Schema & Migration management      |
| **[Neon](https://neon.tech)**                             | Serverless PostgreSQL              |
| **JWT + Cookie Auth**                                     | User session management            |

---

## 🤖 Project Structure

```bash
📦src
 ┣ 📂db
 ┃ ┣ 📜schema.ts       # Drizzle schema (define tables here)
 ┃ ┣ 📜migration.ts    # Script to run migration
 ┃ ┗ 📂migrations    
 ┣ 📜index.ts           # Bun server entry (Elysia app)
 ┣ 📂bookmark
 ┃ ┗ 📜index.ts             #  route handlers
 ┣ 📂auth
 ┃ ┣ 📜plugin.ts      
 ┃ ┗ 📜index.ts             #  authentication 
```

---

## ⚙️ Database Setup

### 📜 Schema & Migration

Drizzle schema is defined in:
`src/db/schema.ts`

Run the following to **generate migration files** from schema:

```bash
bun run db-generate --name anyname
```

Run the migration to sync with Neon DB:

```bash
bun run db-migration
```

### Scripts (from `package.json`)

```json
{
  "db-generate": "drizzle-kit generate --dialect=postgresql --schema=./src/db/schema.ts  --out=./src/db/migrations",
  "db-migration": "bun run src/db/migration.ts"
}
```

> ☠️ After 2 hours of typing `catogory` in schema, routes, and everywhere…
> 🤦‍♂️ Me: *"Wait… it’s actually spelled **category**… isn’t it?"*

---

## 🚀 Run the Server

```bash
bun --watch src/index.ts
```

---

## 🔐 Auth Endpoints (Updated)

### 🆕 `POST /user/signup`

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

### 🆗 `POST /user/login`

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

> Stores a JWT in `auth` cookie.

---

## 🔖 Bookmarks & Categories Endpoints

All routes require a valid session (cookie `auth` from login/signup).

---

## ➕ Add Bookmark

### `POST /user/add`

**Add a bookmark under a category. Creates category if it doesn't exist.**

#### Body:

```json
{
  "category": "learning",
  "link": "https://chat.openai.com"
}
```

---

## ➕ Add Bookmark via Param

### `POST /user/add/:category`

```json
{
  "link": "https://bun.sh"
}
```

---

## 📄 Get All Bookmarks (Grouped)

### `GET /user/`

Returns:

```json
{
  "learning": ["https://chat.openai.com"],
  "tools": ["https://bun.sh"]
}
```

---

## 📁 Get Bookmarks in a Category

### `GET /user/:category`

Returns:

```json
{
  "tools": ["https://bun.sh"]
}
```

---

## ✏️ Update Bookmark

### `PATCH /user/update/:category`

```json
{
  "oldLink": "https://chat.openai.com",
  "newLink": "https://openai.com"
}
```

---

## ❌ Delete Bookmark or Entire Category

### Delete a Bookmark

`DELETE /user/delete/:category`

```json
{
  "link": "https://bun.sh",
  "consent": true
}
```

---

### Delete Whole Category

```json
{
  "consent": true
}
```
---

## 💡 Developer Notes

* Stick to consistent **naming** — it's **category**, not **catogory**.
* All endpoints expect a valid **JWT auth cookie**.
* Database is **fully typesafe** with Drizzle & Neon.
* Auto-reload server with `bun --watch`.

---

Sure! Here's a clean and stylish closing line you can add to the end of your README:

---

**Made with ☕, 🤯, and too many typos by [Jatin Yadav](https://github.com/jatin-yadav-sekwal)**

> *(Yes, it's "category", not "catogory"—lesson learned the hard way.)*


