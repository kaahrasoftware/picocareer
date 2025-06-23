
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, Play, Eye, Database, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ScrapingResult {
  success: boolean;
  message: string;
  scraped_count: number;
  inserted_count?: number;
  error_count?: number;
  errors?: any[];
  scholarships?: any[];
}

interface ScholarshipScraperTabProps {
  adminId: string;
}

export function ScholarshipScraperTab({ adminId }: ScholarshipScraperTabProps) {
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
      } else if (dryRun && data.success) {
        toast({
          title: "Preview Completed",
          description: `Found ${data.scraped_count} scholarships in preview`,
        });
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
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            Scholarship Scraper Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button
              onClick={() => handleScrape(true)}
              disabled={isLoading}
              variant="outline"
              size="lg"
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
              size="lg"
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
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm space-y-2">
              <p><strong>Preview:</strong> Test the scraper without saving data to the database</p>
              <p><strong>Start Scraping:</strong> Scrape and save new scholarships to the database</p>
              <p className="text-blue-600 font-medium">The scraper uses AI to enhance and standardize scholarship data from multiple sources.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-green-600" />
            Scraping Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3 p-4 border rounded-lg">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Scholarships.com
              </Badge>
              <p className="text-sm text-muted-foreground">
                General scholarship database with international opportunities and diverse funding sources
              </p>
            </div>
            <div className="space-y-3 p-4 border rounded-lg">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                FastWeb
              </Badge>
              <p className="text-sm text-muted-foreground">
                Comprehensive scholarship search platform with advanced filtering and matching
              </p>
            </div>
            <div className="space-y-3 p-4 border rounded-lg">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Government Sources
              </Badge>
              <p className="text-sm text-muted-foreground">
                Official government scholarship programs (Fulbright, Chevening, DAAD, etc.)
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
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {result.scraped_count}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Scholarships Found
                </div>
              </div>
              
              {result.inserted_count !== undefined && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {result.inserted_count}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Successfully Saved
                  </div>
                </div>
              )}
              
              {result.error_count !== undefined && (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {result.error_count}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Errors
                  </div>
                </div>
              )}

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-gray-600">
                  {result.success ? "✓" : "✗"}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Status
                </div>
              </div>
            </div>

            {result.message && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">{result.message}</p>
              </div>
            )}

            {/* Preview scholarships (dry run) */}
            {result.scholarships && result.scholarships.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Preview of Found Scholarships:</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {result.scholarships.map((scholarship, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-semibold text-lg line-clamp-2">{scholarship.title}</h5>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {scholarship.currency} {scholarship.amount}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 font-medium">
                        {scholarship.provider_name}
                      </p>
                      <p className="text-sm line-clamp-3 mb-3">
                        {scholarship.description}
                      </p>
                      {scholarship.category && (
                        <div className="flex gap-1 flex-wrap">
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
              <div className="space-y-3">
                <h4 className="font-medium text-red-600">Errors Encountered:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-3 rounded border-l-4 border-red-200">
                      <span className="font-medium">{error.scholarship}:</span> {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
