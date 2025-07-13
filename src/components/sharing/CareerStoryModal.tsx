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
import { createStoryScreenshot, downloadStoryImage } from '@/utils/storyScreenshot';
import { 
  Camera, 
  Download, 
  Loader2,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CareerStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: CareerRecommendation[];
  assessmentId: string | null;
}

export const CareerStoryModal = ({
  isOpen,
  onClose,
  recommendations,
  assessmentId
}: CareerStoryModalProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [storyImage, setStoryImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const selectedRecommendation = recommendations[selectedIndex];

  const handleCaptureStory = async () => {
    if (!selectedRecommendation) return;
    
    setIsCapturing(true);
    try {
      const imageDataURL = await createStoryScreenshot({
        recommendation: selectedRecommendation,
        rank: selectedIndex + 1,
        brandingText: "PicoCareer"
      });
      
      setStoryImage(imageDataURL);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to create story screenshot:', error);
      alert('Failed to create story image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownload = () => {
    if (storyImage) {
      const fileName = `${selectedRecommendation.title.replace(/\s+/g, '-').toLowerCase()}-story.png`;
      downloadStoryImage(storyImage, fileName);
    }
  };

  const handleShare = (platform: 'instagram' | 'facebook' | 'whatsapp') => {
    const shareText = `🎯 I just discovered my perfect career match!\n\n✨ ${selectedRecommendation.title} (${Math.round(selectedRecommendation.matchScore)}% match)\n\n🚀 Find your career path with AI-powered assessment`;
    const shareUrl = assessmentId 
      ? `${window.location.origin}/career-assessment/results/${assessmentId}`
      : `${window.location.origin}/career-assessment`;

    let platformUrl = '';
    switch (platform) {
      case 'instagram':
        // Instagram doesn't support direct sharing, so copy to clipboard
        navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`).then(() => {
          alert('Share text copied to clipboard! You can now paste it when sharing to Instagram Stories.');
        });
        return;
      case 'facebook':
        platformUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        platformUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        break;
    }
    
    if (platformUrl) {
      window.open(platformUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const nextCareer = () => {
    if (selectedIndex < recommendations.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setStoryImage(null);
      setShowPreview(false);
    }
  };

  const prevCareer = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setStoryImage(null);
      setShowPreview(false);
    }
  };

  const handleReset = () => {
    setStoryImage(null);
    setShowPreview(false);
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Create Story Post
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!showPreview ? (
            <>
              {/* Career Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Select Career ({selectedIndex + 1} of {recommendations.length})</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevCareer}
                      disabled={selectedIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextCareer}
                      disabled={selectedIndex === recommendations.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Card className="border-2 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        #{selectedIndex + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold text-lg">{selectedRecommendation.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {selectedRecommendation.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium text-primary">
                            {Math.round(selectedRecommendation.matchScore)}% Match
                          </span>
                          {selectedRecommendation.salaryRange && (
                            <span className="text-muted-foreground">
                              {selectedRecommendation.salaryRange}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Create Story Button */}
              <Button
                onClick={handleCaptureStory}
                disabled={isCapturing}
                className="w-full"
                size="lg"
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Story Image...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Create Story Image
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Story Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Story Preview</h3>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                </div>

                {storyImage && (
                  <Card>
                    <CardContent className="p-3">
                      <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={storyImage} 
                          alt="Career Story Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={!storyImage}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={() => handleShare('instagram')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    📱 Instagram
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleShare('facebook')}
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    👥 Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare('whatsapp')}
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    💬 WhatsApp
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    💡 Save the image and share it to your social media stories!
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};