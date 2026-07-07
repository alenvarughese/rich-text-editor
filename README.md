# 📝 Simple Notes — Editor.js Learning Project

A full-stack learning project demonstrating how to integrate **Editor.js** (a block-style rich text editor) with a **NestJS** backend and a **React + Vite** frontend.

## What you'll learn

- How Editor.js stores content as **structured JSON** (not HTML)
- How to configure and register **Editor.js block tools** (Header, List, Checklist, Quote, Image)
- How to **save** and **load** Editor.js JSON via a REST API
- How to handle **image uploads** through a custom backend endpoint
- How to **convert the saved JSON back to HTML** manually (the `NoteView` renderer)

---

## Project Structure

```
rich_text_editor/
├── backend/          NestJS REST API (port 3001)
│   ├── src/
│   │   ├── notes/    CRUD module (controller + service + entity + DTOs)
│   │   └── upload/   Image upload endpoint
│   └── uploads/      Saved images (served as static files)
└── frontend/         React + Vite (port 5173)
    └── src/
        ├── components/Editor.jsx   ← Editor.js wrapper (heavily commented)
        └── pages/
            ├── NotesList.jsx       ← List all notes
            ├── NoteEditor.jsx      ← Create / edit a note
            └── NoteView.jsx        ← Read-only view with custom block renderer
```

---

## Prerequisites

- Node.js 18+
- MySQL 8+ running locally

---

## 1 — MySQL Setup

Open your MySQL client and run:

```sql
CREATE DATABASE notes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> **TypeORM `synchronize: true`** is enabled in `app.module.js`, so the `notes` table is
> created automatically when the backend starts. No manual migration needed for development.

---

## 2 — Backend Setup

```bash
cd backend

# Copy and edit the environment file
copy .env .env.local     # Windows
# cp .env .env.local     # Mac/Linux

# Edit .env — fill in your MySQL credentials:
#   DB_HOST=localhost
#   DB_PORT=3306
#   DB_USERNAME=root
#   DB_PASSWORD=your_password_here
#   DB_NAME=notes_db

# Start in development mode (hot reload via nodemon + babel-node)
npm run start:dev
```

The API will be available at **http://localhost:3001**.

### API Endpoints

| Method | Path              | Description                     |
|--------|-------------------|---------------------------------|
| GET    | /notes            | List all notes (summary only)   |
| POST   | /notes            | Create a note                   |
| GET    | /notes/:id        | Get one note (full content)     |
| PUT    | /notes/:id        | Update a note                   |
| DELETE | /notes/:id        | Delete a note                   |
| POST   | /upload-image     | Upload an image (for Editor.js) |

---

## 3 — Frontend Setup

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Key Files to Read

| File | What it teaches |
|------|----------------|
| `frontend/src/components/Editor.jsx` | Every Editor.js config option explained in comments |
| `frontend/src/pages/NoteView.jsx` | How to convert Editor.js JSON → HTML manually |
| `frontend/src/pages/NoteEditor.jsx` | How to call `editor.save()` and POST the JSON |
| `backend/src/notes/note.entity.js` | Storing Editor.js JSON in a MySQL `json` column |
| `backend/src/upload/upload.controller.js` | The exact response shape Editor.js Image tool expects |

---

## Editor.js JSON Shape (Reference)

```json
{
  "time": 1719999999999,
  "version": "2.30.0",
  "blocks": [
    { "id": "abc", "type": "header",    "data": { "text": "Title", "level": 2 } },
    { "id": "def", "type": "paragraph", "data": { "text": "Hello <b>world</b>" } },
    { "id": "ghi", "type": "list",      "data": { "style": "unordered", "items": ["One", "Two"] } },
    { "id": "jkl", "type": "checklist", "data": { "items": [{ "text": "Task", "checked": false }] } },
    { "id": "mno", "type": "quote",     "data": { "text": "Quote", "caption": "Author" } },
    { "id": "pqr", "type": "image",     "data": { "file": { "url": "http://..." }, "caption": "" } }
  ]
}
```
