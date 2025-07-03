
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';

interface ScholarshipScraperButtonProps {
  onScrapingComplete?: () => void;
}

export function ScholarshipScraperButton({ onScrapingComplete }: ScholarshipScraperButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { session } = useAuthSession();

  const handleScrapeScholarships = async () => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to scrape scholarships.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('scrape-scholarships', {
        body: { userId: session.user.id }
      });

      if (error) throw error;

      toast({
        title: "Scraping Complete",
        description: `Successfully scraped ${data?.count || 0} scholarships.`,
      });

      if (onScrapingComplete) {
        onScrapingComplete();
      }
    } catch (error: any) {
      console.error('Error scraping scholarships:', error);
      toast({
        title: "Scraping Failed",
        description: error.message || "Failed to scrape scholarships. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleScrapeScholarships}
      disabled={isLoading}
      variant="outline"
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isLoading ? 'Scraping...' : 'Scrape New Scholarships'}
    </Button>
  );
}
