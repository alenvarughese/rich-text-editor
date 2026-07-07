// api.js — central place for all HTTP calls to the backend.
// Using plain fetch (no axios) to keep dependencies minimal.

const BASE_URL = 'http://localhost:3001';

// ── Notes ──────────────────────────────────────────────────────────────────

/** Fetch all notes (id, title, created_at only) */
export async function fetchNotes() {
  const res = await fetch(`${BASE_URL}/notes`);
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
}

/** Fetch a single note with full Editor.js content */
export async function fetchNote(id) {
  const res = await fetch(`${BASE_URL}/notes/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch note ${id}`);
  return res.json();
}

/** Create a new note. Payload: { title, content } */
export async function createNote(data) {
  const res = await fetch(`${BASE_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create note');
  }
  return res.json();
}

/** Update an existing note. Payload: { title?, content? } */
export async function updateNote(id, data) {
  const res = await fetch(`${BASE_URL}/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to update note');
  }
  return res.json();
}

/** Delete a note */
export async function deleteNote(id) {
  const res = await fetch(`${BASE_URL}/notes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete note ${id}`);
  return res.json();
}
