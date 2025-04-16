
import { useToast } from "@/hooks/use-toast";

export function useOpportunityShare() {
  const { toast } = useToast();

  const handleShare = async (title: string) => {
    const shareUrl = window.location.href;
    const shareText = `Check out this opportunity: ${title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast({
          title: "Link copied",
          description: "Opportunity link has been copied to clipboard",
        });
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({
        title: "Link copied",
        description: "Opportunity link has been copied to clipboard",
      });
    }
  };

  return { handleShare };
}
