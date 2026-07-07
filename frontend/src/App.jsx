import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NotesList from './pages/NotesList';
import NoteEditor from './pages/NoteEditor';
import NoteView from './pages/NoteView';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="top-nav">
          <a href="/" className="nav-brand">📝 Simple Notes</a>
          <span className="nav-subtitle">Editor.js Learning Project</span>
        </nav>

        <main className="main-content">
          <Routes>
            {/* Home — list of all notes */}
            <Route path="/" element={<NotesList />} />

            {/* Create a new note */}
            <Route path="/notes/new" element={<NoteEditor />} />

            {/* View a note (read-only, custom renderer) */}
            <Route path="/notes/:id" element={<NoteView />} />

            {/* Edit an existing note */}
            <Route path="/notes/:id/edit" element={<NoteEditor />} />

            {/* Catch-all: redirect unknown URLs to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
