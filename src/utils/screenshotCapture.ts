import html2canvas from 'html2canvas';

export interface ScreenshotOptions {
  quality?: number;
  backgroundColor?: string;
  scale?: number;
  useCORS?: boolean;
}

export const captureElementAsImage = async (
  element: HTMLElement,
  options: ScreenshotOptions = {}
): Promise<string> => {
  const defaultOptions = {
    quality: 0.92,
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    allowTaint: false,
    ...options
  };

  try {
    const canvas = await html2canvas(element, defaultOptions);
    return canvas.toDataURL('image/png', defaultOptions.quality);
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    throw new Error('Failed to capture screenshot');
  }
};

export const captureElementById = async (
  elementId: string,
  options: ScreenshotOptions = {}
): Promise<string> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }
  
  return captureElementAsImage(element, options);
};

export const downloadImage = (dataURL: string, filename: string = 'assessment-results.png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};