import { Button } from "@/components/ui/button";
import { generateContentForExistingBlogs } from "@/lib/blog-utils";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export function GenerateContentButton() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      await generateContentForExistingBlogs();
      toast({
        title: "Content Generation Complete",
        description: "All blog posts have been updated with generated content.",
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content for some blog posts.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerate} 
      disabled={isGenerating}
      className="ml-auto"
    >
      {isGenerating ? "Generating..." : "Generate Content"}
    </Button>
  );
}