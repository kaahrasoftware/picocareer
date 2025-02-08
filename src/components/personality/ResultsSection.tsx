
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface ResultsSectionProps {
  profileId: string;
}

interface TestResult {
  personality_traits: string[];
  career_matches: Array<{ title: string; reasoning: string }>;
  major_matches: Array<{ title: string; reasoning: string }>;
  skill_development: string[];
}

type PersonalityTestResult = {
  personality_traits: string;
  career_matches: string;
  major_matches: string;
  skill_development: string;
}

type PersonalityType = {
  type: string;
  title: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  who_they_are: string;
  dicotomy_description: string[];
  keywords: string[];
}

export function ResultsSection({ profileId }: ResultsSectionProps) {
  const { data: results, isLoading, error } = useQuery({
    queryKey: ['personality-test-results', profileId],
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');

      // First get dimension scores to identify personality type
      const { data: dimensionScores, error: dimensionError } = await supabase
        .from('personality_dimension_scores')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (dimensionError) throw dimensionError;
      if (!dimensionScores) throw new Error('No dimension scores found');

      // Calculate the personality type based on dimension scores
      const personalityType = 
        (dimensionScores.e_i_score >= 0 ? 'E' : 'I') +
        (dimensionScores.s_n_score >= 0 ? 'S' : 'N') +
        (dimensionScores.t_f_score >= 0 ? 'T' : 'F') +
        (dimensionScores.j_p_score >= 0 ? 'J' : 'P');

      // Get personality type details
      const { data: typeDetails, error: typeError } = await supabase
        .from('personality_types')
        .select('*')
        .eq('type', personalityType)
        .single();

      if (typeError) throw typeError;

      // Get test results
      const { data, error } = await supabase
        .from('personality_test_results')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (!data) throw new Error('No test results found');
      
      const result = data as PersonalityTestResult;
      
      try {
        const parsedResults: TestResult & { typeDetails: PersonalityType } = {
          personality_traits: JSON.parse(result.personality_traits || '[]'),
          career_matches: JSON.parse(result.career_matches || '[]'),
          major_matches: JSON.parse(result.major_matches || '[]'),
          skill_development: JSON.parse(result.skill_development || '[]'),
          typeDetails: typeDetails as PersonalityType
        };
        return parsedResults;
      } catch (e) {
        console.error('Error parsing test results:', e);
        throw new Error('Failed to parse test results');
      }
    },
  });

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
      
      <Tabs defaultValue="personality" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="careers">Careers</TabsTrigger>
          <TabsTrigger value="majors">Majors</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="personality">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">{results.typeDetails.title} ({results.typeDetails.type})</h3>
                <p className="text-sm text-muted-foreground mb-4">{results.typeDetails.who_they_are}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Key Characteristics</h4>
                <ScrollArea className="h-[100px] rounded-md">
                  <ul className="space-y-2">
                    {results.typeDetails.dicotomy_description.map((trait: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="font-medium text-sm mt-0.5">•</span>
                        <span className="text-sm">{trait}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Strengths</h4>
                  <ScrollArea className="h-[150px] rounded-md">
                    <ul className="space-y-2">
                      {results.typeDetails.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="font-medium text-sm mt-0.5">•</span>
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Areas for Growth</h4>
                  <ScrollArea className="h-[150px] rounded-md">
                    <ul className="space-y-2">
                      {results.typeDetails.weaknesses.map((weakness: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="font-medium text-sm mt-0.5">•</span>
                          <span className="text-sm">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Your Personality Traits</h4>
                <ScrollArea className="h-[150px] rounded-md">
                  <ul className="space-y-2">
                    {results.personality_traits.map((trait: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="font-medium text-sm mt-0.5">•</span>
                        <span className="text-sm">{trait}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="careers">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recommended Career Paths</h3>
            <ScrollArea className="h-[400px] rounded-md">
              <ul className="space-y-6">
                {results.career_matches.map((career, index) => (
                  <li key={index} className="border-b pb-4 last:border-0">
                    <h4 className="font-semibold text-base">{career.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{career.reasoning}</p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="majors">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recommended Academic Majors</h3>
            <ScrollArea className="h-[400px] rounded-md">
              <ul className="space-y-6">
                {results.major_matches.map((major, index) => (
                  <li key={index} className="border-b pb-4 last:border-0">
                    <h4 className="font-semibold text-base">{major.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{major.reasoning}</p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recommended Skill Development</h3>
            <ScrollArea className="h-[400px] rounded-md">
              <ul className="space-y-4">
                {results.skill_development.map((skill: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="font-medium text-sm mt-0.5">•</span>
                    <span className="text-sm">{skill}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
