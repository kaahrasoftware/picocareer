
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

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
      title: "Link copied",
      description: "Major details copied to clipboard!",
      className: "bg-green-50 border-green-200 dark:bg-green-900/50 dark:border-green-800/60",
    });
  };

  return {
    handleShare
  };
}
