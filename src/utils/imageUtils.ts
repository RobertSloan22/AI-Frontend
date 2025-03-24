import axiosInstance from './axiosConfig';

const ALLOWED_DOMAINS = [
  'g.oempartsonline.com',
  'www.gmpartsclub.com',
  'static.oemdtc.com',
  'www.oemdtc.com',
  // Add other trusted domains here
];

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNhYWEiPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';

const isAllowedDomain = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ALLOWED_DOMAINS.some(domain => urlObj.hostname === domain);
  } catch {
    return false;
  }
};

export const getImageUrl = (url: string): string => {
  if (!url) return '';

  try {
    const urlObj = new URL(url);
    
    // If it's already a data URL, return as is
    if (url.startsWith('data:')) {
      return url;
    }

    // If it's a relative URL or from our domain, return as is
    if (urlObj.hostname === window.location.hostname || url.startsWith('/')) {
      return url;
    }

    // For external URLs, use the proxy service
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  } catch (error) {
    console.error('Invalid URL in getImageUrl:', error);
    return '';
  }
}; 