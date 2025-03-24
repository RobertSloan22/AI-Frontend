import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

const getImageUrl = (url) => {
    if (!url) return '';
    try {
        if (window.electron) {
            return `${axiosInstance.defaults.baseURL}/proxy-image?url=${encodeURIComponent(url)}`;
        }
        return url;
    } catch (error) {
        console.error('Error processing image URL:', error);
        return url;
    }
};

export const PersistentImageViewer = ({ image, onClose }) => {
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [isUsingThumbnail, setIsUsingThumbnail] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 400 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!image) return;
        const url = getImageUrl(image.originalUrl || image.url);
        console.log('Setting image URL:', url); // Debug log
        setCurrentImageUrl(url);
    }, [image]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    if (!image) return null;
    
    console.log('PersistentImageViewer received image:', image); // Debug log
    
    const handleImageError = () => {
        console.log('Image load error, trying thumbnail');
        if (!isUsingThumbnail) {
            setCurrentImageUrl(getImageUrl(image.thumbnail));
            setIsUsingThumbnail(true);
        }
    };

    const handleMouseDown = (e) => {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'A') return;
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 100;
        
        setPosition({
            x: Math.min(Math.max(0, newX), maxX),
            y: Math.min(Math.max(0, newY), maxY)
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div 
            className={`fixed bg-gray-800 rounded-lg shadow-lg p-4 z-40 cursor-${isDragging ? 'grabbing' : 'grab'}`}
            style={{
                width: '50vw',
                height: '50vh',
                left: position.x,
                top: position.y,
                userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-bold">{image.title}</h3>
                <button 
                    onClick={onClose}
                    className="text-white hover:text-gray-300"
                >
                    ✕
                </button>
            </div>
            <div className="h-[calc(100%-4rem)] flex items-center justify-center">
                <img 
                    src={currentImageUrl}
                    alt={image.title}
                    className="max-w-full max-h-full object-contain"
                    onError={handleImageError}
                    draggable={false}
                />
            </div>
            {image.sourceUrl && (
                <div className="mt-2 flex justify-between items-center">
                    <a 
                        href={image.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                        View Source
                    </a>
                    {isUsingThumbnail && (
                        <span className="text-gray-400 text-sm">
                            Using thumbnail (original image failed to load)
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}; 