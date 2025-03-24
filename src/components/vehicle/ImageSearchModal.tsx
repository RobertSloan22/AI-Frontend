import React, { useState, useRef, useEffect } from 'react';
import { X, ExternalLink, Save, Database, Trash2 } from 'react-feather';
import axiosInstance from '../../utils/axiosConfig.js';
import { toast } from 'react-hot-toast';
import { Imagemodal } from './Imagemodal';

interface ImageSearchResult {
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  source: string;
  link: string;
}

declare global {
  interface Window {
    electron?: any;
  }
}

const getImageUrl = (url: string) => {
  // Use proxy for Electron clients to avoid CORS issues
  if (window.electron) {
    return `${axiosInstance.defaults.baseURL}/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
};

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchResults: ImageSearchResult[];
  onImageClick: (image: ImageSearchResult) => void;
  onSaveImage: (image: ImageSearchResult) => Promise<any>;
}

interface SavedImage extends ImageSearchResult {
  timestamp?: string;
  _id?: string;  // Add _id field for MongoDB documents
}

export const ImageSearchModal: React.FC<ImageSearchModalProps> = ({
  isOpen,
  onClose,
  searchResults,
  onImageClick,
  onSaveImage,
}) => {
  const [savingStates, setSavingStates] = useState<{ [key: number]: boolean }>({});
  const [deletingStates, setDeletingStates] = useState<{ [key: string]: boolean }>({});
  const [showingSaved, setShowingSaved] = useState(false);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSavedImage, setSelectedSavedImage] = useState<SavedImage | null>(null);

  useEffect(() => {
    // When modal opens and no search results are provided, load saved images
    if (isOpen && searchResults.length === 0) {
      fetchSavedImages();
    }
  }, [isOpen, searchResults]);

  const fetchSavedImages = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/images');
      setSavedImages(response.data);
      setShowingSaved(true);
    } catch (error) {
      console.error('Failed to fetch saved images:', error);
      toast.error('Failed to load saved images');
    } finally {
      setLoading(false);
    }
  };

  const saveImage = async (image: ImageSearchResult, index: number) => {
    try {
      setSavingStates(prev => ({ ...prev, [index]: true }));
      const imageData = {
        title: image.title || 'Untitled',
        imageUrl: image.imageUrl || image.link || '',
        thumbnailUrl: image.thumbnailUrl || '',
        source: image.source || '',
        link: image.link || '',
        timestamp: new Date().toISOString()
      };
      
      const response = await axiosInstance.post('/images', imageData);
      toast.success('Image saved successfully');
      await fetchSavedImages(); // Refresh saved images list
    } catch (error) {
      console.error('Failed to save image:', error);
      toast.error('Failed to save image');
    } finally {
      setSavingStates(prev => ({ ...prev, [index]: false }));
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!imageId) return;
    
    try {
      setDeletingStates(prev => ({ ...prev, [imageId]: true }));
      await axiosInstance.delete(`/images/${imageId}`);
      setSavedImages(prev => prev.filter(img => img._id !== imageId));
      if (selectedSavedImage?._id === imageId) {
        setSelectedSavedImage(null);
      }
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image');
    } finally {
      setDeletingStates(prev => ({ ...prev, [imageId]: false }));
    }
  };

  const handleViewSource = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleSavedImageClick = (image: SavedImage) => {
    setSelectedSavedImage(image);
  };

  const handleBackToGrid = () => {
    setSelectedSavedImage(null);
  };

  const handleExternalImageClick = (imageUrl: string) => {
    window.open(getImageUrl(imageUrl), '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <Imagemodal open={isOpen} onClose={onClose}>
      <div className="image-modal-content h-full">
        {showingSaved ? (
          <div className="saved-images h-full pt-8">
            <div className="flex justify-between mb-4 sticky top-0 z-10 pb-4  p-4 bg-gray-800 bg-opacity-50 rounded-lg border-l-4 border-blue-500">
              <h2 className="text-xl font-bold">Saved Images</h2>
              {searchResults && searchResults.length > 0 && (
                <button onClick={() => setShowingSaved(false)} className="text-blue-500">
                  Back to Search Results
                </button>
              )}
            </div>
            {selectedSavedImage ? (
              <div className="flex flex-col items-center h-full">
                <div className="flex-1 w-full flex justify-center items-center">
                  <img 
                    src={getImageUrl(selectedSavedImage.imageUrl)} 
                    alt={selectedSavedImage.title}
                    className="max-w-[55%] max-h-[70vh] object-contain cursor-pointer"
                    onClick={() => handleExternalImageClick(selectedSavedImage.imageUrl)}
                  />
                </div>
                <div className="mt-4 flex gap-4 mb-4">
                  <button 
                    onClick={handleBackToGrid}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Back to Grid
                  </button>
                  <button 
                    onClick={() => handleViewSource(selectedSavedImage.link)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <ExternalLink size={16} />
                    View Source
                  </button>
                  <button 
                    onClick={() => selectedSavedImage._id && deleteImage(selectedSavedImage._id)}
                    disabled={deletingStates[selectedSavedImage._id || '']}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                    {deletingStates[selectedSavedImage._id || ''] ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {selectedSavedImage.title}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-4">
                {savedImages.map((image: SavedImage, index) => (
                  <div 
                    key={index} 
                    className="saved-image-card border rounded-lg p-4 hover:border-blue-500 cursor-pointer relative group"
                  >
                    <div 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        image._id && deleteImage(image._id);
                      }}
                    >
                      <button
                        disabled={deletingStates[image._id || '']}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div onClick={() => handleSavedImageClick(image)}>
                      <img 
                        src={getImageUrl(image.imageUrl)} 
                        alt={image.title} 
                        className="w-full h-64 object-contain mb-2" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExternalImageClick(image.imageUrl);
                        }}
                      />
                      <p className="mt-2 text-sm font-medium truncate">{image.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(image.timestamp || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          searchResults.length > 0 && (
            <div className="flex flex-col items-center h-full pt-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-4">
                {searchResults.map((image, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer">
                    <img 
                      src={getImageUrl(image.imageUrl)} 
                      alt={image.title} 
                      className="w-full h-64 object-contain mb-2"
                      onClick={() => onImageClick(image)}
                    />
                    <p className="mt-2 text-sm font-medium truncate">{image.title}</p>
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => saveImage(image, index)}
                        disabled={savingStates[index]}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                      >
                        <Save size={16} />
                        {savingStates[index] ? 'Saving...' : 'Save'}
                      </button>
                      <button 
                        onClick={() => handleViewSource(image.link)}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
                      >
                        <ExternalLink size={16} />
                        Source
                      </button>
                      <button 
                        onClick={fetchSavedImages}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
                      >
                        <Database size={16} />
                        Saved
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </Imagemodal>
  );
};
