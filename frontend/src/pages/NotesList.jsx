import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchNotes, deleteNote } from '../api';

export default function NotesList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes()
      .then(setNotes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id, e) {
    e.preventDefault(); // Don't navigate via the Link wrapper
    if (!confirm('Delete this note?')) return;
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return <p className="status">Loading notes…</p>;
  if (error) return <p className="status error">Error: {error}</p>;

  return (
    <div className="page">
      <header className="page-header">
        <h1>📝 My Notes</h1>
        <Link to="/notes/new" className="btn btn-primary">
          + New Note
        </Link>
      </header>

      {notes.length === 0 ? (
        <div className="empty-state">
          <p>No notes yet. Create your first one!</p>
          <Link to="/notes/new" className="btn btn-primary">
            Create Note
          </Link>
        </div>
      ) : (
        <ul className="notes-list">
          {notes.map((note) => (
            <li key={note.id} className="note-card">
              <Link to={`/notes/${note.id}`} className="note-card-link">
                <span className="note-title">{note.title}</span>
                <span className="note-date">
                  {new Date(note.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </Link>
              <div className="note-card-actions">
                <button
                  className="btn btn-sm"
                  onClick={() => navigate(`/notes/${note.id}/edit`)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={(e) => handleDelete(note.id, e)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
