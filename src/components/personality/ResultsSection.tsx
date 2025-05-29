
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
import { PersonalityType } from "./types";

interface TestResult {
  personality_traits: string[];
  career_matches: Array<{ title: string; reasoning: string; score: number; }>;
  major_matches: Array<{ title: string; reasoning: string; score: number; }>;
  skill_development: string[];
}

interface ResultsSectionProps {
  profileId: string;
}

export function ResultsSection({ profileId }: ResultsSectionProps) {
  // Use a placeholder implementation since personality_test_results table doesn't exist
  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['personality-test-results', profileId],
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');

      // Placeholder implementation - return mock data
      console.log('Personality test results not implemented - using mock data');
      
      const mockResult: TestResult = {
        personality_traits: ['INTJ', 'Analytical', 'Creative'],
        career_matches: [
          { title: 'Software Engineer', reasoning: 'Strong analytical skills', score: 85 },
          { title: 'Data Scientist', reasoning: 'Good with numbers and patterns', score: 80 }
        ],
        major_matches: [
          { title: 'Computer Science', reasoning: 'Perfect match for technical skills', score: 90 },
          { title: 'Mathematics', reasoning: 'Strong analytical foundation', score: 75 }
        ],
        skill_development: ['Programming', 'Data Analysis', 'Problem Solving']
      };
      
      return mockResult;
    },
  });

  const { data: personalityTypes, isLoading: typesLoading } = useQuery({
    queryKey: ['personality-types', results?.personality_traits],
    enabled: !!results?.personality_traits?.length,
    queryFn: async () => {
      if (!results?.personality_traits) return [];
      
      console.log('Fetching personality types for:', results.personality_traits);
      const { data, error } = await supabase
        .from('personality_types')
        .select('*')
        .in('type', results.personality_traits);

      if (error) {
        console.error('Error fetching personality types:', error);
        throw error;
      }
      
      console.log('Fetched personality types:', data);
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

  // Ensure personality_traits is always a flat array of strings
  const personalityTraits = Array.isArray(results.personality_traits) 
    ? results.personality_traits.filter(trait => typeof trait === 'string')
    : [];

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
                {personalityTraits.map((type: string, index: number) => {
                  const personalityType = personalityTypes?.find(pt => pt.type === type);
                  if (!personalityType) {
                    console.log('No matching personality type found for:', type);
                    return null;
                  }
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
