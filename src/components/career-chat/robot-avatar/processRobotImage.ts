
import { processImage, MAX_FILE_SIZE } from "@/utils/imageProcessing";

/**
 * Processes the robot image for optimal display
 * - Optimizes for size and performance
 */
export async function processRobotImage(imageFile: File): Promise<string> {
  try {
    // Process the image to ensure it's below size limits
    const processedBlob = await processImage(imageFile);
    
    // Convert to base64 for easy usage in components
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(processedBlob);
    });
  } catch (error) {
    console.error("Error processing robot image:", error);
    throw new Error("Failed to process robot image");
  }
}
