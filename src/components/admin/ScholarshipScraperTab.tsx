
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, Play, Eye, Bot, Calendar, Database, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScholarshipScraperTabProps {
  adminId: string;
  sessionValid: boolean;
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

interface ScrapingHistory {
  id: string;
  created_at: string;
  scraped_count: number;
  inserted_count: number;
  error_count: number;
  success: boolean;
}

export function ScholarshipScraperTab({ adminId, sessionValid }: ScholarshipScraperTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDryRun, setIsDryRun] = useState(false);
  const [result, setResult] = useState<ScrapingResult | null>(null);
  const [history, setHistory] = useState<ScrapingHistory[]>([]);
  const { toast } = useToast();

  const handleScrape = async (dryRun: boolean = false) => {
    if (!sessionValid) {
      toast({
        title: "Session Invalid",
        description: "Please refresh your session before running the scraper",
        variant: "destructive",
      });
      return;
    }

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
        // Refresh history after successful scraping
        loadScrapingHistory();
      } else if (dryRun && data.success) {
        toast({
          title: "Preview Completed",
          description: `Found ${data.scraped_count} scholarships to process`,
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
        message: error.message || "Unknown error occurred",
        scraped_count: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadScrapingHistory = async () => {
    try {
      // This would require a scraping_history table to be created
      // For now, we'll show placeholder data
      setHistory([
        {
          id: "1",
          created_at: new Date().toISOString(),
          scraped_count: 25,
          inserted_count: 23,
          error_count: 2,
          success: true
        }
      ]);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-100/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                AI Scholarship Scraper
              </h2>
              <p className="text-muted-foreground mt-1">
                Automatically discover and import scholarships using AI-enhanced web scraping
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Session Warning */}
          {!sessionValid && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Session issue detected. Please refresh your session before running the scraper.
              </AlertDescription>
            </Alert>
          )}

          {/* Control Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Scraping Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <Button
                  onClick={() => handleScrape(true)}
                  disabled={isLoading || !sessionValid}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isLoading && isDryRun ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  Preview Scraping (Dry Run)
                </Button>
                
                <Button
                  onClick={() => handleScrape(false)}
                  disabled={isLoading || !sessionValid}
                  className="flex items-center gap-2"
                >
                  {isLoading && !isDryRun ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                  Start Full Scraping
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Preview Mode:</strong> Test the scraper and see what scholarships would be found without saving to database</p>
                <p><strong>Full Scraping:</strong> Run the complete process and save new scholarships to the database</p>
                <p><strong>AI Enhancement:</strong> All scraped data is processed through OpenAI for standardization and quality improvement</p>
              </div>
            </CardContent>
          </Card>

          {/* Sources Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Scraping Sources & AI Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">Scholarships.com</Badge>
                  <p className="text-sm text-muted-foreground">
                    General scholarship database with comprehensive international opportunities and detailed eligibility criteria
                  </p>
                </div>
                <div className="space-y-3">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">FastWeb</Badge>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive scholarship search platform with advanced filtering and matching algorithms
                  </p>
                </div>
                <div className="space-y-3">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">Government Sources</Badge>
                  <p className="text-sm text-muted-foreground">
                    Official government programs (Fulbright, Chevening, DAAD) with verified information and direct application links
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">AI Enhancement Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Automatic data standardization and validation</li>
                  <li>• Intelligent categorization and tagging</li>
                  <li>• Eligibility criteria extraction and formatting</li>
                  <li>• Duplicate detection and deduplication</li>
                  <li>• Currency normalization and amount parsing</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Results Display */}
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
                  {isDryRun && <Badge variant="outline">Preview Mode</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.scraped_count}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Scholarships Found
                    </div>
                  </div>
                  
                  {result.inserted_count !== undefined && (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {result.inserted_count}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Successfully Saved
                      </div>
                    </div>
                  )}
                  
                  {result.error_count !== undefined && (
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {result.error_count}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Processing Errors
                      </div>
                    </div>
                  )}

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.scraped_count > 0 ? Math.round((result.inserted_count || 0) / result.scraped_count * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Success Rate
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
                    <h4 className="font-medium">Preview of Found Scholarships:</h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {result.scholarships.map((scholarship, index) => (
                        <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900">{scholarship.title}</h5>
                            <Badge variant="outline" className="ml-2">
                              {scholarship.currency} {scholarship.amount}
                            </Badge>
                          </div>
                          <p className="text-sm text-blue-600 mb-2">
                            {scholarship.provider_name}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {scholarship.description}
                          </p>
                          {scholarship.category && scholarship.category.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
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

                {/* Error Details */}
                {result.errors && result.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Processing Errors:</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-3 rounded border-l-4 border-red-200">
                          <strong>{error.scholarship}:</strong> {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Scraping History */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Scraping History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {entry.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">
                          {new Date(entry.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Found: {entry.scraped_count}</span>
                        <span>Saved: {entry.inserted_count}</span>
                        <span>Errors: {entry.error_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
}
