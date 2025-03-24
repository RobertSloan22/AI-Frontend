import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Save, Eye, Trash2 } from 'react-feather';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosConfig';
import { Imagemodal } from './Imagemodal';
import { getImageUrl } from '../../utils/imageUtils';

interface ImageSearchResult {
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  source: string;
  link: string;
  _id?: string;  // Add _id for MongoDB documents
}

interface ImageSearchResultsProps {
  searchResults: ImageSearchResult[];
  onImageClick: (image: ImageSearchResult) => void;
  onSaveImage: (image: ImageSearchResult) => Promise<void>;
}

export const ImageSearchResults: React.FC<ImageSearchResultsProps> = ({
  searchResults,
  onImageClick,
  onSaveImage,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savingStates, setSavingStates] = useState<{ [key: number]: boolean }>({});
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [failedImages, setFailedImages] = useState<{ [key: number]: boolean }>({});
  const [deletingStates, setDeletingStates] = useState<{ [key: string]: boolean }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDiagram, setSelectedDiagram] = useState<{
    url: string;
    title: string;
    thumbnail?: string;
    sourceUrl?: string;
    fileType: string;
  } | null>(null);

  // Memoize the image loading handler
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

  const handleImageError = useCallback((result: ImageSearchResult, index: number, imgElement: HTMLImageElement) => {
    const currentSrc = imgElement.src;
    
    // Prevent infinite retry loop by tracking attempts in state
    if (failedImages[index]) {
      return; // Already failed, don't retry
    }

    try {
      // Try the next URL in sequence
      if (currentSrc.includes(encodeURIComponent(result.thumbnailUrl))) {
        // Only use imageUrl if it's a valid image URL
        if (isValidImageUrl(result.imageUrl)) {
          imgElement.src = getImageUrl(result.imageUrl);
        } else if (isValidImageUrl(result.link)) {
          imgElement.src = getImageUrl(result.link);
        } else {
          setFailedImages(prev => ({ ...prev, [index]: true }));
          imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNhYWEiPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
        }
      } else if (currentSrc.includes(encodeURIComponent(result.imageUrl))) {
        // Try source link only if it's a valid image URL
        if (isValidImageUrl(result.link)) {
          imgElement.src = getImageUrl(result.link);
        } else {
          setFailedImages(prev => ({ ...prev, [index]: true }));
          imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNhYWEiPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
        }
      } else {
        setFailedImages(prev => ({ ...prev, [index]: true }));
        console.log('All image sources failed:', result.title);
      }
    } catch (error) {
      console.error('Error processing image URL:', error);
      setFailedImages(prev => ({ ...prev, [index]: true }));
    }
  }, [failedImages, isValidImageUrl]);

  // Update the initial image loading to use validated URLs
  const getInitialImageUrl = useCallback((result: ImageSearchResult) => {
    if (isValidImageUrl(result.thumbnailUrl)) {
      return getImageUrl(result.thumbnailUrl);
    } else if (isValidImageUrl(result.imageUrl)) {
      return getImageUrl(result.imageUrl);
    } else if (isValidImageUrl(result.link)) {
      return getImageUrl(result.link);
    }
    return null;
  }, [isValidImageUrl]);

  useEffect(() => {
    // Reset states when search results change
    setFailedImages({});
    setLoadingStates({});
  }, [searchResults]);

  useEffect(() => {
    if (searchResults.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % searchResults.length);
      }, 5000); // Cycle every 5 seconds

      return () => clearInterval(interval);
    }
  }, [searchResults.length]);

  if (searchResults.length === 0) {
    return <div className="text-center text-gray-400 py-4">No search results available.</div>;
  }

  const handleSaveImage = async (image: ImageSearchResult, index: number) => {
    try {
      setSavingStates(prev => ({ ...prev, [index]: true }));
      await onSaveImage(image);
      toast.success('Image saved successfully');
    } catch (error) {
      console.error('Failed to save image:', error);
      toast.error('Failed to save image');
    } finally {
      setSavingStates(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleViewSource = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleDeleteImage = async (image: ImageSearchResult, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    
    if (!image._id) return;
    
    try {
      setDeletingStates(prev => ({ ...prev, [image._id!]: true }));
      await axiosInstance.delete(`/images/${image._id}`);
      toast.success('Image deleted successfully');
      // Optionally refresh the search results if needed
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image');
    } finally {
      setDeletingStates(prev => ({ ...prev, [image._id!]: false }));
    }
  };

  const currentImage = searchResults[currentIndex];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {searchResults.map((result, index) => (
        <div
          key={`${result.imageUrl}-${index}`}
          className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 relative group"
        >
          {result._id && (
            <div 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <button
                onClick={(e) => handleDeleteImage(result, e)}
                disabled={deletingStates[result._id || '']}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
          <div className="relative aspect-w-16 aspect-h-9">
            <img
              src={getInitialImageUrl(result) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNhYWEiPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4='}
              alt={result.title}
              className={`w-full h-full object-cover cursor-pointer transition-opacity duration-200 ${
                failedImages[index] ? 'opacity-50' : ''
              }`}
              onClick={() => !failedImages[index] && onImageClick(result)}
              loading="lazy"
              onError={(e) => handleImageError(result, index, e.target as HTMLImageElement)}
              onLoad={() => {
                setLoadingStates(prev => ({ ...prev, [index]: false }));
                console.log('Image loaded successfully:', result.title);
              }}
            />
            {/* Loading/Saving/Deleting indicator */}
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200"
              style={{ opacity: (loadingStates[index] || savingStates[index] || deletingStates[result._id || '']) ? '1' : '0' }}
            >
              {(loadingStates[index] || savingStates[index] || deletingStates[result._id || '']) && (
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              )}
            </div>
          </div>
          <div className="p-3">
            <h4 className="text-sm text-white font-medium line-clamp-2 mb-2">
              {result.title}
            </h4>
            <div className="flex justify-between items-center">
              <button
                onClick={() => onImageClick(result)}
                className={`text-xs ${
                  failedImages[index]
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white px-3 py-1 rounded-md transition-colors duration-200`}
                disabled={failedImages[index]}
              >
                View
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => !savingStates[index] && onSaveImage(result)}
                  className={`text-xs ${
                    savingStates[index]
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white px-3 py-1 rounded-md transition-colors duration-200`}
                  disabled={savingStates[index]}
                >
                  {savingStates[index] ? 'Saving...' : 'Save'}
                </button>
                {result._id && (
                  <button
                    onClick={(e) => handleDeleteImage(result, e)}
                    disabled={deletingStates[result._id || '']}
                    className={`text-xs ${
                      deletingStates[result._id || '']
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600'
                    } text-white px-3 py-1 rounded-md transition-colors duration-200`}
                  >
                    {deletingStates[result._id || ''] ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};