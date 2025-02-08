
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { PersonalityCard } from "./PersonalityCard";
import { MatchesSection } from "./MatchesSection";
import { SkillsSection } from "./SkillsSection";
import { TestResult, PersonalityTestResult, PersonalityType } from "./types";

interface ResultsSectionProps {
  profileId: string;
}

export function ResultsSection({ profileId }: ResultsSectionProps) {
  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['personality-test-results', profileId],
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');

      const { data: resultData, error } = await supabase
        .from('personality_test_results')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (!resultData) throw new Error('No test results found');
      
      const result = resultData as PersonalityTestResult;
      
      try {
        // Handle both string and array formats for personality_traits
        let personalityTraits: string[];
        if (typeof result.personality_traits === 'string') {
          try {
            personalityTraits = JSON.parse(result.personality_traits);
          } catch {
            personalityTraits = [result.personality_traits];
          }
        } else {
          personalityTraits = result.personality_traits;
        }

        const parsedResults: TestResult = {
          personality_traits: personalityTraits,
          career_matches: JSON.parse(result.career_matches || '[]'),
          major_matches: JSON.parse(result.major_matches || '[]'),
          skill_development: JSON.parse(result.skill_development || '[]')
        };
        return parsedResults;
      } catch (e) {
        console.error('Error parsing test results:', e);
        throw new Error('Failed to parse test results');
      }
    },
  });

  const { data: personalityTypes, isLoading: typesLoading } = useQuery({
    queryKey: ['personality-types', results?.personality_traits],
    enabled: !!results?.personality_traits,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personality_types')
        .select('*')
        .in('type', results.personality_traits);

      if (error) throw error;
      return data as PersonalityType[];
    },
  });

  if (resultsLoading || typesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-8">
        <p>No test results found. Please take the personality test first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Your Personality Analysis Results</h2>
      
      <Tabs defaultValue="personality" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="careers">Careers</TabsTrigger>
          <TabsTrigger value="majors">Majors</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="personality">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Personality Types</h3>
            <ScrollArea className="h-[600px] rounded-md">
              <div className="grid gap-6">
                {results.personality_traits.map((type: string, index: number) => {
                  const personalityType = personalityTypes?.find(pt => pt.type === type);
                  if (!personalityType) return null;
                  return (
                    <PersonalityCard 
                      key={type}
                      personalityType={personalityType}
                      index={index}
                    />
                  );
                })}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="careers">
          <MatchesSection 
            items={results.career_matches}
            title="Recommended Career Paths"
          />
        </TabsContent>

        <TabsContent value="majors">
          <MatchesSection 
            items={results.major_matches}
            title="Recommended Academic Majors"
          />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsSection skills={results.skill_development} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
