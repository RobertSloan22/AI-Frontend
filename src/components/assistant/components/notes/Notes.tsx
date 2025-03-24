import React, { useState } from 'react';
import { X, ExternalLink, Grid } from 'react-feather';
import './Notes.scss';

interface NoteEntry {
  id?: string;
  timestamp: string;
  topic: string;
  tags: string[];
  keyPoints: string[];
  codeExamples?: {
    language: string;
    code: string;
  }[];
  resources?: string[];
  actionItems?: string[];
  images?: string[];
  conversationId?: string;
}

interface NotesProps {
  notes: NoteEntry[];
  onSaveNote: (note: NoteEntry) => Promise<any>;
  onExportNotes: () => void;
  onDeleteNote?: (noteId: string) => Promise<void>;
  onSearchNotes?: (query: string, filter: string) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export const Notes: React.FC<NotesProps> = ({ 
  notes, 
  onSaveNote, 
  onExportNotes, 
  onDeleteNote,
  onSearchNotes,
  isOpen, 
  onClose,
  isLoading = false 
}) => {
  const [selectedNote, setSelectedNote] = useState<NoteEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  const handleNoteClick = (note: NoteEntry) => {
    setSelectedNote(note);
  };

  const handleBackToGrid = () => {
    setSelectedNote(null);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !onSearchNotes) return;
    setIsSearching(true);
    try {
      await onSearchNotes(searchQuery, searchFilter);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!onDeleteNote || !noteId) return;
    try {
      await onDeleteNote(noteId);
      setSelectedNote(null);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-gray-800 z-10 p-4 flex flex-col gap-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white">Session Notes</h2>
            <div className="flex gap-4">
              {selectedNote && (
                <button 
                  onClick={handleBackToGrid}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-600 text-xl"
                >
                  <Grid size={20} />
                  Back to Grid
                </button>
              )}
              <button 
                onClick={onExportNotes}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-xl"
              >
                Export Notes
              </button>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-gray-700 rounded text-white"
              >
                <X size={28} />
              </button>
            </div>
          </div>

          {!selectedNote && onSearchNotes && (
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded border border-gray-600"
              />
              <select
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600"
              >
                <option value="all">All</option>
                <option value="topic">Topic</option>
                <option value="tags">Tags</option>
                <option value="content">Content</option>
              </select>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-2xl text-gray-400">Loading notes...</div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {notes && notes.length > 0 ? (
              selectedNote ? (
                <div className="note-detail animate-fade-in">
                  <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
                    <div className="mb-8 flex justify-between items-start">
                      <div>
                        <h3 className="text-4xl font-bold mb-4 text-white">{selectedNote.topic}</h3>
                        <div className="text-gray-400 mb-4 text-xl">
                          {formatTimestamp(selectedNote.timestamp)}
                        </div>
                      </div>
                      {onDeleteNote && selectedNote.id && (
                        <button
                          onClick={() => handleDelete(selectedNote.id!)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete Note
                        </button>
                      )}
                    </div>

                    <div className="space-y-8">
                      <div className="key-points">
                        <h4 className="text-2xl font-semibold mb-4 text-white">Key Points</h4>
                        <ul className="list-disc pl-8 space-y-3">
                          {selectedNote.keyPoints?.map((point, idx) => (
                            <li key={idx} className="text-gray-300 text-xl">{point}</li>
                          ))}
                        </ul>
                      </div>

                      {selectedNote.codeExamples && selectedNote.codeExamples.length > 0 && (
                        <div className="code-examples">
                          <h4 className="text-2xl font-semibold mb-4 text-white">Code Examples</h4>
                          {selectedNote.codeExamples.map((example, idx) => (
                            <pre key={idx} className="bg-gray-950 text-gray-100 p-6 rounded-lg overflow-x-auto text-lg">
                              <code className={`language-${example.language}`}>
                                {example.code}
                              </code>
                            </pre>
                          ))}
                        </div>
                      )}

                      {selectedNote.resources && selectedNote.resources.length > 0 && (
                        <div className="resources">
                          <h4 className="text-2xl font-semibold mb-4 text-white">Resources</h4>
                          <ul className="list-disc pl-8 space-y-3">
                            {selectedNote.resources.map((resource, idx) => (
                              <li key={idx}>
                                <a 
                                  href={resource} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 text-xl"
                                >
                                  {resource}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedNote.actionItems && selectedNote.actionItems.length > 0 && (
                        <div className="action-items">
                          <h4 className="text-2xl font-semibold mb-4 text-white">Action Items</h4>
                          <ul className="list-disc pl-8 space-y-3">
                            {selectedNote.actionItems.map((item, idx) => (
                              <li key={idx} className="text-gray-300 text-xl">{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {notes.map((note, index) => (
                    <div 
                      key={index} 
                      className="note-card bg-gray-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow cursor-pointer hover:bg-gray-750"
                      onClick={() => handleNoteClick(note)}
                    >
                      <h3 className="text-2xl font-semibold mb-3 truncate text-white">{note.topic}</h3>
                      <div className="text-gray-400 text-lg mb-4">{formatTimestamp(note.timestamp)}</div>
                      
                      <div className="flex flex-wrap gap-3 mb-6">
                        {note.tags?.slice(0, 3).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex} 
                            className="px-3 py-2 bg-blue-900 text-blue-100 rounded-full text-lg"
                          >
                            #{tag}
                          </span>
                        ))}
                        {note.tags?.length > 3 && (
                          <span className="text-gray-400 text-lg">+{note.tags.length - 3} more</span>
                        )}
                      </div>

                      <div className="text-gray-400">
                        <p className="text-lg mb-3">Key Points: {note.keyPoints?.length || 0}</p>
                        {note.codeExamples && note.codeExamples.length > 0 && (
                          <p className="text-lg mb-3">Code Examples: {note.codeExamples.length}</p>
                        )}
                        {note.resources && note.resources.length > 0 && (
                          <p className="text-lg">Resources: {note.resources.length}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center text-gray-400 py-8 text-2xl">
                {searchQuery ? 'No notes found matching your search' : 'No notes available'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 