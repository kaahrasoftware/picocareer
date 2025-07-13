import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAssessmentSharing, SharingPlatform } from '@/hooks/useAssessmentSharing';
import { CareerRecommendation } from '@/types/assessment';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Camera, 
  Copy, 
  Check, 
  Loader2,
  X,
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
  const { toast } = useToast();
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [sharingPlatform, setSharingPlatform] = useState<string | null>(null);

  const {
    platforms,
    captureResultsScreenshot,
    shareViaPlatform,
    copyToClipboard,
    isCapturingScreenshot,
    shareImage,
    hasRecommendations
  } = useAssessmentSharing(assessmentId, recommendations);

  const handleCaptureScreenshot = async () => {
    try {
      await captureResultsScreenshot('results-panel');
      toast({
        title: "Screenshot captured!",
        description: "Your results are ready to share.",
      });
    } catch (error) {
      toast({
        title: "Screenshot failed",
        description: "Unable to capture results. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (platform: SharingPlatform) => {
    setSharingPlatform(platform.id);
    try {
      const success = await shareViaPlatform(platform);
      if (success) {
        toast({
          title: `Shared to ${platform.name}!`,
          description: "Your results have been shared successfully.",
        });
        onClose();
      } else {
        throw new Error('Sharing failed');
      }
    } catch (error) {
      toast({
        title: "Sharing failed",
        description: `Unable to share to ${platform.name}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setSharingPlatform(null);
    }
  };

  const handleCopyLink = async () => {
    try {
      const success = await copyToClipboard();
      if (success) {
        setCopiedToClipboard(true);
        toast({
          title: "Copied to clipboard!",
          description: "Your share text and link have been copied.",
        });
        setTimeout(() => setCopiedToClipboard(false), 2000);
      }
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
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
      
      toast({
        title: "Downloaded!",
        description: "Your results screenshot has been saved.",
      });
    }
  };

  if (!hasRecommendations) {
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
                  disabled={sharingPlatform === platform.id || (platform.requiresImage && !shareImage)}
                  className={`${platform.color} text-white border-0 hover:text-white transition-all duration-200`}
                >
                  {sharingPlatform === platform.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <span className="mr-2">{platform.icon}</span>
                  )}
                  {platform.name}
                </Button>
              ))}
            </div>
            {platforms.some(p => p.requiresImage) && !shareImage && (
              <p className="text-xs text-muted-foreground text-center">
                📸 Capture a screenshot to share on Instagram
              </p>
            )}
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