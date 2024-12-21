export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const MAX_DIMENSION = 1200; // Maximum width/height for images
const QUALITY_STEPS = [0.9, 0.8, 0.7, 0.6, 0.5]; // Quality reduction steps

export const processImage = async (blob: Blob): Promise<Blob> => {
  if (blob.size <= MAX_FILE_SIZE) {
    return blob;
  }

  // Create an image element to get dimensions
  const img = new Image();
  const imageUrl = URL.createObjectURL(blob);
  
  try {
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;

    // Scale down image if too large
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    ctx.drawImage(img, 0, 0, width, height);

    // Try different quality levels until we get under MAX_FILE_SIZE
    for (const quality of QUALITY_STEPS) {
      const processedBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob!),
          'image/jpeg',
          quality
        );
      });
      
      if (processedBlob.size <= MAX_FILE_SIZE) {
        return processedBlob;
      }
    }

    // If we still can't get under MAX_FILE_SIZE, return the smallest version
    return await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/jpeg',
        QUALITY_STEPS[QUALITY_STEPS.length - 1]
      );
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};