
// URL utilities for detecting and transforming embeddable links

export const detectUrlType = (url: string) => {
  if (!url) return 'unknown';
  
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('youtube.com/watch') || urlLower.includes('youtu.be/')) {
    return 'youtube';
  }
  if (urlLower.includes('vimeo.com/')) {
    return 'vimeo';
  }
  if (urlLower.includes('docs.google.com/document')) {
    return 'google-docs';
  }
  if (urlLower.includes('docs.google.com/presentation')) {
    return 'google-slides';
  }
  if (urlLower.includes('docs.google.com/spreadsheets')) {
    return 'google-sheets';
  }
  if (urlLower.includes('drive.google.com')) {
    return 'google-drive';
  }
  
  return 'generic';
};

export const getEmbeddableUrl = (url: string, type: string) => {
  switch (type) {
    case 'youtube':
      return transformYouTubeUrl(url);
    case 'vimeo':
      return transformVimeoUrl(url);
    case 'google-docs':
      return transformGoogleDocsUrl(url);
    case 'google-slides':
      return transformGoogleSlidesUrl(url);
    case 'google-sheets':
      return transformGoogleSheetsUrl(url);
    default:
      return url;
  }
};

const transformYouTubeUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    let videoId = '';
    
    if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v') || '';
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (error) {
    console.error('Error transforming YouTube URL:', error);
  }
  return url;
};

const transformVimeoUrl = (url: string) => {
  try {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
  } catch (error) {
    console.error('Error transforming Vimeo URL:', error);
  }
  return url;
};

const transformGoogleDocsUrl = (url: string) => {
  if (url.includes('/edit')) {
    return url.replace('/edit', '/preview');
  }
  return url;
};

const transformGoogleSlidesUrl = (url: string) => {
  if (url.includes('/edit')) {
    return url.replace('/edit', '/embed');
  }
  return url;
};

const transformGoogleSheetsUrl = (url: string) => {
  if (url.includes('/edit')) {
    return url.replace('/edit', '/preview');
  }
  return url;
};

export const isEmbeddable = (type: string) => {
  return ['youtube', 'vimeo', 'google-docs', 'google-slides', 'google-sheets'].includes(type);
};

export const getYouTubeThumbnail = (url: string) => {
  try {
    const urlObj = new URL(url);
    let videoId = '';
    
    if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v') || '';
    }
    
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
  } catch (error) {
    console.error('Error getting YouTube thumbnail:', error);
  }
  return null;
};
