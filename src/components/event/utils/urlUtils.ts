
// URL utilities for detecting and transforming embeddable links

export const detectUrlType = (url: string) => {
  if (!url) return 'unknown';
  
  const urlLower = url.toLowerCase();
  
  console.log('Detecting URL type for:', url);
  
  if (urlLower.includes('youtube.com/watch') || urlLower.includes('youtu.be/')) {
    console.log('Detected YouTube URL');
    return 'youtube';
  }
  if (urlLower.includes('vimeo.com/')) {
    console.log('Detected Vimeo URL');
    return 'vimeo';
  }
  if (urlLower.includes('docs.google.com/document')) {
    console.log('Detected Google Docs URL');
    return 'google-docs';
  }
  if (urlLower.includes('docs.google.com/presentation')) {
    console.log('Detected Google Slides URL');
    return 'google-slides';
  }
  if (urlLower.includes('docs.google.com/spreadsheets')) {
    console.log('Detected Google Sheets URL');
    return 'google-sheets';
  }
  if (urlLower.includes('drive.google.com')) {
    console.log('Detected Google Drive URL');
    return 'google-drive';
  }
  
  console.log('URL type detected as generic');
  return 'generic';
};

export const getEmbeddableUrl = (url: string, type: string) => {
  console.log('Getting embeddable URL for type:', type, 'URL:', url);
  
  switch (type) {
    case 'youtube':
      const youtubeUrl = transformYouTubeUrl(url);
      console.log('Transformed YouTube URL:', youtubeUrl);
      return youtubeUrl;
    case 'vimeo':
      const vimeoUrl = transformVimeoUrl(url);
      console.log('Transformed Vimeo URL:', vimeoUrl);
      return vimeoUrl;
    case 'google-docs':
      const docsUrl = transformGoogleDocsUrl(url);
      console.log('Transformed Google Docs URL:', docsUrl);
      return docsUrl;
    case 'google-slides':
      const slidesUrl = transformGoogleSlidesUrl(url);
      console.log('Transformed Google Slides URL:', slidesUrl);
      return slidesUrl;
    case 'google-sheets':
      const sheetsUrl = transformGoogleSheetsUrl(url);
      console.log('Transformed Google Sheets URL:', sheetsUrl);
      return sheetsUrl;
    default:
      console.log('No transformation available for type:', type);
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
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      console.log('YouTube video ID extracted:', videoId, 'Embed URL:', embedUrl);
      return embedUrl;
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
      const embedUrl = `https://player.vimeo.com/video/${match[1]}`;
      console.log('Vimeo video ID extracted:', match[1], 'Embed URL:', embedUrl);
      return embedUrl;
    }
  } catch (error) {
    console.error('Error transforming Vimeo URL:', error);
  }
  return url;
};

const transformGoogleDocsUrl = (url: string) => {
  if (url.includes('/edit')) {
    const embedUrl = url.replace('/edit', '/preview');
    console.log('Google Docs URL transformed:', embedUrl);
    return embedUrl;
  }
  return url;
};

const transformGoogleSlidesUrl = (url: string) => {
  if (url.includes('/edit')) {
    const embedUrl = url.replace('/edit', '/embed');
    console.log('Google Slides URL transformed:', embedUrl);
    return embedUrl;
  }
  return url;
};

const transformGoogleSheetsUrl = (url: string) => {
  if (url.includes('/edit')) {
    const embedUrl = url.replace('/edit', '/preview');
    console.log('Google Sheets URL transformed:', embedUrl);
    return embedUrl;
  }
  return url;
};

export const isEmbeddable = (type: string) => {
  const embeddableTypes = ['youtube', 'vimeo', 'google-docs', 'google-slides', 'google-sheets'];
  const result = embeddableTypes.includes(type);
  console.log('Is embeddable check for type:', type, 'Result:', result);
  return result;
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
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      console.log('YouTube thumbnail URL generated:', thumbnailUrl);
      return thumbnailUrl;
    }
  } catch (error) {
    console.error('Error getting YouTube thumbnail:', error);
  }
  return null;
};
