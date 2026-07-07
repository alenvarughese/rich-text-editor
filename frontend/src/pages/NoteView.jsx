import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchNote, deleteNote } from '../api';

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK RENDERER
// ─────────────────────────────────────────────────────────────────────────────
//
// Editor.js stores content as an array of "blocks", each with a type and data.
// Here we map each block type back to HTML manually, so you can see exactly
// what each block's data payload looks like.
//
// This is intentionally hand-rolled — no third-party renderer — so the mapping
// is transparent and educational.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders a single Editor.js block into a React element.
 *
 * Block structure:
 *   {
 *     id:   "abc123"           ← Editor.js auto-generated
 *     type: "header"           ← which tool produced this block
 *     data: { ... }            ← tool-specific payload (see each case below)
 *   }
 */
function renderBlock(block, index) {
  const { type, data } = block;

  switch (type) {
    // ── PARAGRAPH ─────────────────────────────────────────────────────────
    // data: { text: "Hello <b>world</b>" }
    // Editor.js stores inline formatting (bold, italic, links) as HTML inside
    // the text string, so we use dangerouslySetInnerHTML to render it.
    case 'paragraph':
      return (
        <p
          key={index}
          className="block-paragraph"
          dangerouslySetInnerHTML={{ __html: data.text }}
        />
      );

    // ── HEADER ─────────────────────────────────────────────────────────────
    // data: { text: "Heading text", level: 2 }
    // level is 1–6, maps directly to H1–H6.
    case 'header': {
      const Tag = `h${data.level}`; // dynamic tag: "h1", "h2", etc.
      return (
        <Tag
          key={index}
          className={`block-header block-header-${data.level}`}
          dangerouslySetInnerHTML={{ __html: data.text }}
        />
      );
    }

    // ── LIST ───────────────────────────────────────────────────────────────
    // data: { style: "ordered" | "unordered", items: ["item1", "item2"] }
    // Items may contain inline HTML (bold, links, etc.)
    case 'list': {
      const ListTag = data.style === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag key={index} className={`block-list block-list-${data.style}`}>
          {data.items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ListTag>
      );
    }

    // ── CHECKLIST ──────────────────────────────────────────────────────────
    // data: { items: [{ text: "Buy milk", checked: true }, ...] }
    case 'checklist':
      return (
        <ul key={index} className="block-checklist">
          {data.items.map((item, i) => (
            <li key={i} className={item.checked ? 'checked' : ''}>
              <span className="checkbox">{item.checked ? '✅' : '⬜'}</span>
              <span dangerouslySetInnerHTML={{ __html: item.text }} />
            </li>
          ))}
        </ul>
      );

    // ── QUOTE ──────────────────────────────────────────────────────────────
    // data: { text: "Quote body", caption: "Author name", alignment: "left" }
    case 'quote':
      return (
        <figure key={index} className="block-quote">
          <blockquote dangerouslySetInnerHTML={{ __html: data.text }} />
          {data.caption && (
            <figcaption dangerouslySetInnerHTML={{ __html: data.caption }} />
          )}
        </figure>
      );

    // ── IMAGE ──────────────────────────────────────────────────────────────
    // data: {
    //   file: { url: "http://localhost:3001/uploads/xyz.jpg" },
    //   caption: "Optional caption",
    //   withBorder: false,
    //   stretched: false,
    //   withBackground: false
    // }
    case 'image': {
      const imgClasses = [
        'block-image',
        data.withBorder ? 'with-border' : '',
        data.stretched ? 'stretched' : '',
        data.withBackground ? 'with-background' : '',
      ]
        .filter(Boolean)
        .join(' ');

      return (
        <figure key={index} className={imgClasses}>
          <img src={data.file.url} alt={data.caption || 'Note image'} />
          {data.caption && <figcaption>{data.caption}</figcaption>}
        </figure>
      );
    }

    // ── FALLBACK ───────────────────────────────────────────────────────────
    // If you add more tools later, they'll show up here until you handle them.
    default:
      return (
        <div key={index} className="block-unknown">
          <em>
            Unknown block type: <code>{type}</code>
          </em>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTE VIEW PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function NoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNote(id)
      .then(setNote)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this note?')) return;
    await deleteNote(id);
    navigate('/');
  }

  if (loading) return <p className="status">Loading…</p>;
  if (error) return <p className="status error">Error: {error}</p>;
  if (!note) return <p className="status">Note not found.</p>;

  // note.content is the full Editor.js JSON: { time, version, blocks: [...] }
  const blocks = note.content?.blocks || [];

  return (
    <div className="page">
      <header className="page-header">
        <Link to="/" className="btn btn-sm">
          ← Back
        </Link>
        <h1 style={{ flex: 1 }}>{note.title}</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-sm" onClick={() => navigate(`/notes/${id}/edit`)}>
            Edit
          </button>
          <button className="btn btn-sm btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </header>

      <p className="note-meta">
        Created:{' '}
        {new Date(note.created_at).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
        {note.updated_at !== note.created_at && (
          <>
            {' · Updated: '}
            {new Date(note.updated_at).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </>
        )}
      </p>

      {/* Render each block using our custom renderBlock switch */}
      <article className="note-content">
        {blocks.length === 0 ? (
          <p className="status">This note has no content yet.</p>
        ) : (
          blocks.map((block, i) => renderBlock(block, i))
        )}
      </article>

      {/* Debug panel — comment this out once you understand the JSON structure */}
      <details className="debug-panel">
        <summary>🔍 Raw Editor.js JSON (click to expand)</summary>
        <pre>{JSON.stringify(note.content, null, 2)}</pre>
      </details>
    </div>
  );
}
