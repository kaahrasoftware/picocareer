
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, Play, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ScholarshipScraperDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScrapingComplete?: () => void;
}

interface ScrapingResult {
  success: boolean;
  message: string;
  scraped_count: number;
  inserted_count?: number;
  error_count?: number;
  errors?: any[];
  scholarships?: any[];
}

export function ScholarshipScraperDialog({ isOpen, onClose, onScrapingComplete }: ScholarshipScraperDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDryRun, setIsDryRun] = useState(false);
  const [result, setResult] = useState<ScrapingResult | null>(null);
  const { toast } = useToast();

  const handleScrape = async (dryRun: boolean = false) => {
    setIsLoading(true);
    setIsDryRun(dryRun);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-scholarships', {
        body: { 
          sources: ['scholarships.com', 'fastweb', 'government'],
          dryRun 
        }
      });

      if (error) throw error;

      setResult(data);
      
      if (!dryRun && data.success) {
        toast({
          title: "Scraping Completed",
          description: `Successfully scraped ${data.inserted_count} scholarships`,
        });
        onScrapingComplete?.();
      }
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: "Scraping Failed",
        description: "An error occurred while scraping scholarships",
        variant: "destructive",
      });
      setResult({
        success: false,
        message: error.message,
        scraped_count: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scholarship Web Scraper</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Control Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scraping Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={() => handleScrape(true)}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isLoading && isDryRun ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  Preview (Dry Run)
                </Button>
                
                <Button
                  onClick={() => handleScrape(false)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading && !isDryRun ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Start Scraping
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Preview:</strong> Test the scraper without saving data to the database</p>
                <p><strong>Start Scraping:</strong> Scrape and save new scholarships to the database</p>
              </div>
            </CardContent>
          </Card>

          {/* Sources Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scraping Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Badge variant="secondary">Scholarships.com</Badge>
                  <p className="text-sm text-muted-foreground">
                    General scholarship database with international opportunities
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary">FastWeb</Badge>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive scholarship search platform
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary">Government Sources</Badge>
                  <p className="text-sm text-muted-foreground">
                    Official government scholarship programs (Fulbright, Chevening, etc.)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  Scraping Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.scraped_count}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Scholarships Found
                    </div>
                  </div>
                  
                  {result.inserted_count !== undefined && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {result.inserted_count}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Successfully Saved
                      </div>
                    </div>
                  )}
                  
                  {result.error_count !== undefined && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {result.error_count}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Errors
                      </div>
                    </div>
                  )}
                </div>

                {result.message && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm">{result.message}</p>
                  </div>
                )}

                {/* Preview scholarships (dry run) */}
                {result.scholarships && result.scholarships.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Preview of Found Scholarships:</h4>
                    <div className="space-y-3">
                      {result.scholarships.map((scholarship, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium">{scholarship.title}</h5>
                            <Badge variant="outline">
                              {scholarship.currency} {scholarship.amount}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {scholarship.provider_name}
                          </p>
                          <p className="text-sm line-clamp-2">
                            {scholarship.description}
                          </p>
                          {scholarship.category && (
                            <div className="flex gap-1 mt-2">
                              {scholarship.category.map((cat: string, catIndex: number) => (
                                <Badge key={catIndex} variant="secondary" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errors */}
                {result.errors && result.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Errors:</h4>
                    <div className="space-y-1">
                      {result.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error.scholarship}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
