import React, { useEffect, useState } from 'react';
import { Note } from '../../../../types/notes';

export const NotesWindow: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const loadNotes = async () => {
      const loadedNotes = await window.electronAPI.loadNotes();
      setNotes(loadedNotes);
    };
    loadNotes();
  }, []);

  return (
    <div className="notes-window">
      <div className="notes-header">
        <h2>Saved Notes</h2>
        <div className="header-actions">
          <button onClick={() => window.electronAPI.exportNotes()}>Export Notes</button>
          <button onClick={() => window.electronAPI.closeWindow()}>Close</button>
        </div>
      </div>
      <div className="notes-content">
        {notes.map((note) => (
          <div key={note.id || note.timestamp} className="note-entry">
            <div className="note-topic">
              <h3>{note.topic}</h3>
              <span className="timestamp">
                {new Date(note.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="note-details">
              <h4>Key Points:</h4>
              <ul>
                {note.keyPoints.map((point, i) => (
                  <li key={`${note.id || note.timestamp}-point-${i}`}>{point}</li>
                ))}
              </ul>
              {note.codeExamples && note.codeExamples.length > 0 && (
                <div className="code-examples">
                  <h4>Code Examples:</h4>
                  {note.codeExamples.map((codeExample, i) => (
                    <pre key={`${note.id || note.timestamp}-code-${i}`}>
                      <code>{codeExample.code}</code>
                    </pre>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 