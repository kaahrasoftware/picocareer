import { useState } from 'react';
import { CareerRecommendation } from '@/types/assessment';
import { captureElementById } from '@/utils/screenshotCapture';

export interface SharingPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  shareUrl: (params: ShareParams) => string;
  requiresImage?: boolean;
}

export interface ShareParams {
  url: string;
  title: string;
  text: string;
  image?: string;
}

export const useAssessmentSharing = (
  assessmentId: string | null,
  recommendations: CareerRecommendation[]
) => {
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [shareImage, setShareImage] = useState<string | null>(null);

  const generateShareContent = () => {
    const topRecommendation = recommendations[0];
    const matchCount = recommendations.length;
    
    const shareUrl = assessmentId 
      ? `${window.location.origin}/career-assessment/results/${assessmentId}`
      : `${window.location.origin}/career-assessment`;

    const shareText = topRecommendation
      ? `🎯 I just discovered my career matches!\n\n✨ Top recommendation: ${topRecommendation.title} (${topRecommendation.matchScore}% match)\n📊 ${matchCount} personalized career recommendations\n🚀 AI-powered analysis complete\n\nDiscover your career path:`
      : `🎯 I just completed my career assessment!\n\n📊 Get personalized career recommendations\n🚀 AI-powered career analysis\n\nDiscover your career path:`;

    return {
      url: shareUrl,
      title: 'My Career Assessment Results - PicoCareer',
      text: shareText
    };
  };

  const platforms: SharingPlatform[] = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-[#25D366] hover:bg-[#20bc5a]',
      shareUrl: ({ text, url }) => 
        `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-[#0077B5] hover:bg-[#006699]',
      shareUrl: ({ url, title, text }) => 
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(text)}`
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '👥',
      color: 'bg-[#1877F2] hover:bg-[#166fe5]',
      shareUrl: ({ url }) => 
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📸',
      color: 'bg-gradient-to-r from-[#E4405F] to-[#833AB4] hover:from-[#d73653] hover:to-[#7431a1]',
      requiresImage: true,
      shareUrl: () => '' // Instagram uses native sharing
    }
  ];

  const captureResultsScreenshot = async (elementId: string = 'results-panel') => {
    setIsCapturingScreenshot(true);
    try {
      const imageDataURL = await captureElementById(elementId);
      setShareImage(imageDataURL);
      return imageDataURL;
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      throw error;
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  const shareToNative = async (platform: SharingPlatform) => {
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }

    const content = generateShareContent();
    
    try {
      const shareData: any = {
        title: content.title,
        text: content.text,
        url: content.url
      };

      // For Instagram or platforms that need images, include the screenshot
      if (platform.requiresImage && shareImage) {
        // Convert data URL to blob for native sharing
        const response = await fetch(shareImage);
        const blob = await response.blob();
        const file = new File([blob], 'assessment-results.png', { type: 'image/png' });
        shareData.files = [file];
      }

      await navigator.share(shareData);
      return true;
    } catch (error) {
      console.error('Native sharing failed:', error);
      return false;
    }
  };

  const shareToUrl = (platform: SharingPlatform) => {
    const content = generateShareContent();
    const shareUrl = platform.shareUrl(content);
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      return true;
    }
    return false;
  };

  const shareViaPlatform = async (platform: SharingPlatform) => {
    // For Instagram or native sharing, try native first
    if (platform.requiresImage || platform.id === 'instagram') {
      const nativeSuccess = await shareToNative(platform);
      if (nativeSuccess) return true;
    }

    // Fallback to URL sharing
    return shareToUrl(platform);
  };

  const copyToClipboard = async () => {
    const content = generateShareContent();
    const textToCopy = `${content.text}\n\n${content.url}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  };

  return {
    platforms,
    generateShareContent,
    captureResultsScreenshot,
    shareViaPlatform,
    copyToClipboard,
    isCapturingScreenshot,
    shareImage,
    hasRecommendations: recommendations.length > 0
  };
};