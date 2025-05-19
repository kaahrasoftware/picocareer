
import { useToast } from "@/components/ui/use-toast";

export function useMajorSharing() {
  const { toast } = useToast();

  const handleShare = async (majorId: string, majorTitle: string, description: string) => {
    const shareUrl = `${window.location.origin}/program?dialog=true&majorId=${majorId}`;
    const shareText = `Check out this major: ${majorTitle}\n\n${description}\n\nLearn more at:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Share Major',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          fallbackShare(shareText, shareUrl);
        }
      }
    } else {
      fallbackShare(shareText, shareUrl);
    }
  };

  const fallbackShare = (shareText: string, shareUrl: string) => {
    const fullText = `${shareText} ${shareUrl}`;
    navigator.clipboard.writeText(fullText);
    toast({
      title: "Success",
      description: "Major details copied to clipboard!",
    });
  };

  return {
    handleShare
  };
}
