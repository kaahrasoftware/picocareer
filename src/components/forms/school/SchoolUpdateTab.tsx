
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { SimpleSchoolSelector } from "./SimpleSchoolSelector";
import { SchoolDataPreview } from "./SchoolDataPreview";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { School } from "@/types/database/schools";

interface AISchoolData {
  aiData: Partial<School>;
  currentData: School;
  success: boolean;
}

interface SimpleSchool {
  id: string;
  name: string;
  location?: string;
}

export function SchoolUpdateTab() {
  const [selectedSchool, setSelectedSchool] = useState<SimpleSchool | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiData, setAiData] = useState<AISchoolData | null>(null);
  const { toast } = useToast();

  const handleFetchAIData = async () => {
    if (!selectedSchool) {
      toast({
        title: "Error",
        description: "Please select a school first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-school-data', {
        body: {
          schoolName: selectedSchool.name,
          schoolId: selectedSchool.id.startsWith('manual-') ? null : selectedSchool.id
        }
      });

      if (error) throw error;

      if (data.success) {
        setAiData(data);
        toast({
          title: "Success",
          description: "AI data fetched successfully! Review the changes below.",
        });
      } else {
        throw new Error(data.error || 'Failed to fetch AI data');
      }
    } catch (error: any) {
      console.error('Error fetching AI data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch AI data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSchool = async (fieldsToUpdate: Record<string, any>) => {
    if (!selectedSchool || !aiData) return;

    // Don't try to update manually entered schools
    if (selectedSchool.id.startsWith('manual-')) {
      toast({
        title: "Cannot Update",
        description: "Manually entered schools cannot be updated. Please select an existing school from the database.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('schools')
        .update(fieldsToUpdate)
        .eq('id', selectedSchool.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "School updated successfully!",
      });

      // Reset the form
      setAiData(null);
      setSelectedSchool(null);
    } catch (error: any) {
      console.error('Error updating school:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update school",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAiData(null);
    setSelectedSchool(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered School Data Update
          </CardTitle>
          <CardDescription>
            Select a school and let AI fetch comprehensive data to update the school's information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select School</label>
              <SimpleSchoolSelector
                value={selectedSchool}
                onValueChange={setSelectedSchool}
                disabled={isLoading}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleFetchAIData}
                disabled={!selectedSchool || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching AI Data...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Fetch Data with AI
                  </>
                )}
              </Button>
            </div>
          </div>

          {selectedSchool?.id.startsWith('manual-') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> You've entered a school manually. AI data fetching works best with schools from our database.
              </p>
            </div>
          )}

          {aiData && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Review AI-Fetched Data</h3>
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
              <SchoolDataPreview
                aiData={aiData.aiData}
                currentData={aiData.currentData}
                onUpdate={handleUpdateSchool}
                isLoading={isLoading}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
