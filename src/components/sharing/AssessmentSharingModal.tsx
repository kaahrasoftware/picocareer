import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CareerRecommendation } from '@/types/assessment';
import { 
  Share2, 
  Camera, 
  Copy, 
  Check, 
  Loader2,
  Download
} from 'lucide-react';

interface AssessmentSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId: string | null;
  recommendations: CareerRecommendation[];
}

export const AssessmentSharingModal = ({
  isOpen,
  onClose,
  assessmentId,
  recommendations
}: AssessmentSharingModalProps) => {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
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
  const platforms = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-[#25D366] hover:bg-[#20bc5a]',
      shareUrl: (text: string, url: string) => 
        `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-[#0077B5] hover:bg-[#006699]',
      shareUrl: (text: string, url: string) => 
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent('My Career Assessment Results')}&summary=${encodeURIComponent(text)}`
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '👥',
      color: 'bg-[#1877F2] hover:bg-[#166fe5]',
      shareUrl: (text: string, url: string) => 
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-[#1DA1F2] hover:bg-[#1a91da]',
      shareUrl: (text: string, url: string) => 
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text}\n\n${url}`)}`
    }
  ];

  const handleCaptureScreenshot = async () => {
    setIsCapturingScreenshot(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById('results-panel');
      if (!element) {
        throw new Error('Results panel not found');
      }
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false
      });
      
      const imageDataURL = canvas.toDataURL('image/png', 0.92);
      setShareImage(imageDataURL);
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      alert('Failed to capture screenshot. Please try again.');
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  const handleShare = (platform: any) => {
    const content = generateShareContent();
    const shareUrl = platform.shareUrl(content.text, content.url);
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    const content = generateShareContent();
    const textToCopy = `${content.text}\n\n${content.url}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  const downloadScreenshot = () => {
    if (shareImage) {
      const link = document.createElement('a');
      link.download = 'career-assessment-results.png';
      link.href = shareImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Your Results
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Screenshot Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Capture Results
              </h3>
              {shareImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadScreenshot}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              )}
            </div>
            
            {shareImage ? (
              <Card>
                <CardContent className="p-3">
                  <img 
                    src={shareImage} 
                    alt="Assessment Results Preview" 
                    className="w-full h-32 object-cover rounded-md border"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCaptureScreenshot}
                    disabled={isCapturingScreenshot}
                    className="w-full mt-2"
                  >
                    {isCapturingScreenshot ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Capturing...
                      </>
                    ) : (
                      <>
                        <Camera className="h-3 w-3 mr-2" />
                        Retake Screenshot
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Button
                variant="outline"
                onClick={handleCaptureScreenshot}
                disabled={isCapturingScreenshot}
                className="w-full"
              >
                {isCapturingScreenshot ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Capturing Screenshot...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Capture Screenshot
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Social Platforms */}
          <div className="space-y-3">
            <h3 className="font-medium">Share To</h3>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <Button
                  key={platform.id}
                  variant="outline"
                  onClick={() => handleShare(platform)}
                  className={`${platform.color} text-white border-0 hover:text-white transition-all duration-200`}
                >
                  <span className="mr-2">{platform.icon}</span>
                  {platform.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-3">
            <h3 className="font-medium">Or Copy Link</h3>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="w-full"
            >
              {copiedToClipboard ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Share Text & Link
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};