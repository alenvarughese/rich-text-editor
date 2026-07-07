import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Editor from '../components/Editor';
import { fetchNote, createNote, updateNote } from '../api';

/**
 * NoteEditor — used for BOTH create (/notes/new) and edit (/notes/:id/edit).
 *
 * How it knows which mode it's in:
 *   - If useParams() returns { id }, we're in edit mode → load the existing note.
 *   - If id is undefined (route is /notes/new), we're in create mode.
 */
export default function NoteEditor() {
  const { id } = useParams(); // undefined when creating
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [initialData, setInitialData] = useState(undefined);
  const [loading, setLoading] = useState(isEditMode); // only load if editing
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // This ref is passed to <Editor> so we can call editorRef.current.save()
  // when the user clicks Save. See Editor.jsx for how it's attached.
  const editorRef = useRef(null);

  // In edit mode, load the existing note and pre-fill title + editor data
  useEffect(() => {
    if (!isEditMode) return;
    fetchNote(id)
      .then((note) => {
        setTitle(note.title);
        // note.content is the Editor.js JSON object stored in the DB.
        // Passing it as initialData causes Editor.js to re-render those blocks.
        setInitialData(note.content);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  async function handleSave() {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // editor.save() returns the full Editor.js output object:
      // { time, version, blocks: [...] }
      // This is what we POST to the backend and store as JSON in the DB.
      const content = await editorRef.current.save();

      if (isEditMode) {
        await updateNote(id, { title, content });
        navigate(`/notes/${id}`); // go to view after edit
      } else {
        const created = await createNote({ title, content });
        navigate(`/notes/${created.id}`); // go to view after create
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="status">Loading note…</p>;

  return (
    <div className="page">
      <header className="page-header">
        <Link to="/" className="btn btn-sm">
          ← Back
        </Link>
        <h1>{isEditMode ? 'Edit Note' : 'New Note'}</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Note'}
        </button>
      </header>

      {error && <p className="status error">Error: {error}</p>}

      <div className="editor-wrapper">
        <input
          type="text"
          className="title-input"
          placeholder="Note title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 
          The Editor component mounts Editor.js into a real DOM node.
          We pass:
            editorRef — so this parent can call .save()
            initialData — the Editor.js JSON to pre-populate (edit mode only)
          
          IMPORTANT: We only render <Editor> once initialData is ready.
          In create mode that's immediately. In edit mode we wait for the
          fetch to complete (loading === false) so the editor initialises
          with the correct data rather than empty and then trying to load.
        */}
        {!loading && (
          <Editor editorRef={editorRef} initialData={initialData} />
        )}
      </div>
    </div>
  );
}
