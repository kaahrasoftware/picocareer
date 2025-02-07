
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ResultsSectionProps {
  profileId: string;
}

type TestResult = {
  personality_traits: string[];
  career_matches: Array<{ title: string; reasoning: string }>;
  major_matches: Array<{ title: string; reasoning: string }>;
  skill_development: string[];
};

export function ResultsSection({ profileId }: ResultsSectionProps) {
  const navigate = useNavigate();

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['personality-test-results', profileId],
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');

      const { data, error } = await supabase
        .from('personality_test_results')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (!data) throw new Error('No test results found');
      
      const parsedResults: TestResult = {
        personality_traits: JSON.parse(data.personality_traits || '[]'),
        career_matches: JSON.parse(data.career_matches || '[]'),
        major_matches: JSON.parse(data.major_matches || '[]'),
        skill_development: JSON.parse(data.skill_development || '[]')
      };
      
      return parsedResults;
    },
  });

  useEffect(() => {
    if (!profileId) {
      navigate('/auth');
    }
  }, [profileId, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="text-center py-8">
        <p>No test results found. Please take the personality test first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Your Personality Analysis Results</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Key Personality Traits</h3>
          <ScrollArea className="h-[200px] rounded-md">
            <ul className="space-y-2">
              {results.personality_traits.map((trait: string, index: number) => (
                <li key={index} className="text-sm">{trait}</li>
              ))}
            </ul>
          </ScrollArea>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recommended Career Paths</h3>
          <ScrollArea className="h-[200px] rounded-md">
            <ul className="space-y-4">
              {results.career_matches.map((career, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{career.title}</span>
                  <p className="text-muted-foreground mt-1">{career.reasoning}</p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </Card>

        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Recommended Academic Majors</h3>
          <ScrollArea className="h-[200px] rounded-md">
            <ul className="space-y-4">
              {results.major_matches.map((major, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{major.title}</span>
                  <p className="text-muted-foreground mt-1">{major.reasoning}</p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
