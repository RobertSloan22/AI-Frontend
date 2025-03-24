import React, { useState, useEffect, useCallback } from 'react';
import { X, ExternalLink, Save, Database } from 'react-feather';
import axiosInstance from '../../utils/axiosConfig.js';
import { toast } from 'react-hot-toast';
import { Imagemodal } from './Imagemodal';
import { getImageUrl } from '../../utils/imageUtils';

interface ImageSearchResult {
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  source: string;
  link: string;
}

interface SavedImage extends ImageSearchResult {
  timestamp: string;
}

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchResults: ImageSearchResult[];
  onImageClick: (image: ImageSearchResult) => void;
  onSaveImage: (image: ImageSearchResult) => Promise<any>;
}

export const ImageSearchModal: React.FC<ImageSearchModalProps> = ({
  isOpen,
  onClose,
  searchResults,
  onImageClick,
  onSaveImage,
}) => {
  const [savingStates, setSavingStates] = useState<{ [key: number]: boolean }>({});
  const [showingSaved, setShowingSaved] = useState(false);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<{ [key: string]: boolean }>({});
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (isOpen && searchResults.length === 0) {
      fetchSavedImages();
    }
  }, [isOpen, searchResults]);

  useEffect(() => {
    // Reset states when search results change
    setImageLoadErrors({});
    setLoadingStates({});
  }, [searchResults]);

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

  const isValidImageUrl = useCallback((url: string) => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      
      // Check if URL points to an HTML page (likely not an image)
      if (urlObj.pathname.endsWith('.html') || urlObj.pathname.endsWith('.htm')) {
        return false;
      }

      // Check if URL ends with common image extensions
      const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
      const hasImageExtension = imageExtensions.test(urlObj.pathname);

      // If it has an image extension, it's valid
      if (hasImageExtension) {
        return true;
      }

      // For URLs without extensions, we'll try to load them through the proxy
      // The proxy will handle content-type verification
      return true;
    } catch (error) {
      console.error('Invalid URL:', error);
      return false;
    }
  }, []);

  const handleImageError = useCallback((image: ImageSearchResult, imgElement: HTMLImageElement) => {
    console.log('Image load error:', image.imageUrl);
    
    try {
      // Try URLs in sequence: thumbnail -> main image -> link -> placeholder
      if (isValidImageUrl(image.thumbnailUrl)) {
        console.log('Trying thumbnail URL:', image.thumbnailUrl);
        imgElement.src = getImageUrl(image.thumbnailUrl);
      } else if (isValidImageUrl(image.imageUrl)) {
        console.log('Trying main image URL:', image.imageUrl);
        imgElement.src = getImageUrl(image.imageUrl);
      } else if (isValidImageUrl(image.link)) {
        console.log('Trying source link:', image.link);
        imgElement.src = getImageUrl(image.link);
      } else {
        console.log('All image sources failed for:', image.title);
        setImageLoadErrors(prev => ({ ...prev, [image.imageUrl]: true }));
        imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNhYWEiPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
      }
    } catch (error) {
      console.error('Error processing image URL:', error);
      setImageLoadErrors(prev => ({ ...prev, [image.imageUrl]: true }));
    }
  }, [isValidImageUrl]);

  const getInitialImageUrl = useCallback((image: ImageSearchResult) => {
    if (isValidImageUrl(image.thumbnailUrl)) {
      return getImageUrl(image.thumbnailUrl);
    } else if (isValidImageUrl(image.imageUrl)) {
      return getImageUrl(image.imageUrl);
    } else if (isValidImageUrl(image.link)) {
      return getImageUrl(image.link);
    }
    return null;
  }, [isValidImageUrl]);

  const handleSaveImage = async (image: ImageSearchResult, index: number) => {
    try {
      setSavingStates(prev => ({ ...prev, [index]: true }));
      await onSaveImage(image);
      toast.success('Image saved successfully');
      await fetchSavedImages(); // Refresh saved images list
    } catch (error) {
      console.error('Failed to save image:', error);
      toast.error('Failed to save image');
    } finally {
      setSavingStates(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleViewSource = (link: string) => {
    if (window.electron) {
      window.open(link, '_blank', 'nodeIntegration=no,width=1200,height=900');
    } else {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <Imagemodal open={isOpen} onClose={onClose}>
      <div className="image-modal-content h-full">
        <div className="flex justify-between items-center p-4 bg-gray-800 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white">
            {showingSaved ? 'Saved Images' : 'Search Results'}
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowingSaved(!showingSaved);
                if (!showingSaved) fetchSavedImages();
              }}
              className="text-blue-400 hover:text-blue-300"
            >
              {showingSaved ? 'View Search Results' : 'View Saved Images'}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {(showingSaved ? savedImages : searchResults).map((image, index) => (
                <div
                  key={`${image.imageUrl}-${index}`}
                  className="bg-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative aspect-w-16 aspect-h-9">
                    <img
                      src={getInitialImageUrl(image) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNhYWEiPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4='}
                      alt={image.title}
                      className={`w-full h-64 object-contain cursor-pointer transition-opacity duration-200 ${
                        imageLoadErrors[image.imageUrl] ? 'opacity-50' : ''
                      }`}
                      onClick={() => !imageLoadErrors[image.imageUrl] && onImageClick(image)}
                      loading="lazy"
                      onError={(e) => handleImageError(image, e.target as HTMLImageElement)}
                      onLoad={() => {
                        setLoadingStates(prev => ({ ...prev, [index]: false }));
                        console.log('Image loaded successfully:', image.title);
                      }}
                    />
                    {/* Loading/Error State Indicator */}
                    <div 
                      className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200 ${
                        loadingStates[index] || imageLoadErrors[image.imageUrl] ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {loadingStates[index] && (
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                      )}
                      {imageLoadErrors[image.imageUrl] && (
                        <div className="text-white text-sm text-center p-2">
                          Unable to load image
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-white font-medium truncate">{image.title}</p>
                    {showingSaved && 'timestamp' in image && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date((image as SavedImage).timestamp).toLocaleDateString()}
                      </p>
                    )}
                    {!showingSaved && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveImage(image, index)}
                          disabled={savingStates[index]}
                          className={`flex items-center gap-1 px-3 py-1 text-white rounded text-xs ${
                            savingStates[index] ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                        >
                          <Save size={16} />
                          {savingStates[index] ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => handleViewSource(image.link)}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs"
                        >
                          <ExternalLink size={16} />
                          Source
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Imagemodal>
  );
};
