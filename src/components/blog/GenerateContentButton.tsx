import { Button } from "@/components/ui/button";
import { generateContentForExistingBlogs } from "@/lib/blog-utils";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function GenerateContentButton() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if current user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single();
      
      return profile?.user_type === 'admin';
    },
  });

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

  // Only render the button if user is admin
  if (!isAdmin) return null;

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