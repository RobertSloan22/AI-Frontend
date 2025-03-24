import React, { useEffect, useState } from 'react';
import { X, Plus, Image, Printer } from 'react-feather';
import { NoteEntry } from '../../../../types/notes';

// Extend the existing ElectronAPI interface
declare global {
  interface ElectronAPI {
    openNoteWindow: (note: NoteEntry) => void;
    onNoteData: (callback: (note: NoteEntry) => void) => void;
    closeNoteWindow: () => void;
    saveNote: (note: NoteEntry) => void;
  }
}

export const NoteViewer: React.FC = () => {
  const [note, setNote] = useState<NoteEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newKeyPoint, setNewKeyPoint] = useState('');
  const [newResource, setNewResource] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (window.electronAPI?.onNoteData) {
      window.electronAPI.onNoteData((noteData: NoteEntry) => {
        setNote(noteData);
      });
    }
  }, []);

  const handleAddKeyPoint = () => {
    if (!note || !newKeyPoint.trim()) return;
    const updatedNote = {
      ...note,
      keyPoints: [...note.keyPoints, newKeyPoint.trim()]
    };
    setNote(updatedNote);
    setNewKeyPoint('');
    window.electronAPI?.saveNote(updatedNote);
  };

  const handleAddResource = () => {
    if (!note || !newResource.trim()) return;
    const updatedNote = {
      ...note,
      resources: [...(note.resources || []), newResource.trim()]
    };
    setNote(updatedNote);
    setNewResource('');
    window.electronAPI?.saveNote(updatedNote);
  };

  const handleAddImage = () => {
    if (!note || !newImageUrl.trim()) return;
    const updatedNote = {
      ...note,
      images: [...(note.images || []), newImageUrl.trim()]
    };
    setNote(updatedNote);
    setNewImageUrl('');
    window.electronAPI?.saveNote(updatedNote);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!note) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-[2000px] mx-auto print:max-w-none">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">{note.topic}</h1>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="p-3 hover:bg-gray-700 rounded text-white"
            title="Print Notes"
          >
            <Printer size={28} />
          </button>
          <button 
            onClick={() => window.electronAPI?.closeNoteWindow()}
            className="p-3 hover:bg-gray-700 rounded text-white"
          >
            <X size={28} />
          </button>
        </div>
      </div>

      <div className="mb-6 text-gray-400 text-xl">
        {new Date(note.timestamp).toLocaleString()}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {note.tags.map((tag, index) => (
          <span 
            key={index}
            className="px-4 py-2 bg-blue-900 text-blue-100 rounded-full text-lg"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">Key Points</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newKeyPoint}
                onChange={(e) => setNewKeyPoint(e.target.value)}
                placeholder="Add new key point"
                className="px-4 py-2 border rounded text-lg bg-gray-700 text-white border-gray-600"
              />
              <button
                onClick={handleAddKeyPoint}
                className="p-3 hover:bg-gray-700 rounded text-white"
                title="Add Key Point"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
          <ul className="list-disc pl-8 space-y-3">
            {note.keyPoints.map((point, index) => (
              <li key={index} className="text-gray-300 text-xl">{point}</li>
            ))}
          </ul>
        </section>

        {note.codeExamples && note.codeExamples.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Code Examples</h2>
            {note.codeExamples.map((example, index) => (
              <pre key={index} className="bg-gray-950 text-gray-100 p-6 rounded-lg overflow-x-auto mb-4 text-lg">
                <code className={`language-${example.language}`}>
                  {example.code}
                </code>
              </pre>
            ))}
          </section>
        )}

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">Resources</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newResource}
                onChange={(e) => setNewResource(e.target.value)}
                placeholder="Add new resource URL"
                className="px-4 py-2 border rounded text-lg bg-gray-700 text-white border-gray-600"
              />
              <button
                onClick={handleAddResource}
                className="p-3 hover:bg-gray-700 rounded text-white"
                title="Add Resource"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
          <ul className="list-disc pl-8 space-y-3">
            {note.resources?.map((resource, index) => (
              <li key={index}>
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
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">Images</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Add image URL"
                className="px-4 py-2 border rounded text-lg bg-gray-700 text-white border-gray-600"
              />
              <button
                onClick={handleAddImage}
                className="p-3 hover:bg-gray-700 rounded text-white"
                title="Add Image"
              >
                <Image size={24} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {note.images?.map((imageUrl, index) => (
              <div key={index} className="relative">
                <img
                  src={imageUrl}
                  alt={`Note image ${index + 1}`}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}; 