
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Diamond, Square, Circle } from "lucide-react";
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
  dicotomy_description: string[];
  who_they_are: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
}

export function ResultsSection({ profileId }: ResultsSectionProps) {
  const { data: results, isLoading: resultsLoading } = useQuery({
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
      
      const result = data as PersonalityTestResult;
      
      try {
        const parsedPersonalityTraits = JSON.parse(result.personality_traits);
        const traits = Array.isArray(parsedPersonalityTraits[0]) ? 
          parsedPersonalityTraits[0] : 
          parsedPersonalityTraits;

        const parsedResults: TestResult = {
          personality_traits: traits,
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
                  const rankConfig = {
                    0: {
                      icon: Diamond,
                      label: "Primary Match",
                      bgColor: "bg-primary/10",
                      textColor: "text-primary",
                      accentColor: "bg-primary"
                    },
                    1: {
                      icon: Square,
                      label: "Secondary Match",
                      bgColor: "bg-secondary/10",
                      textColor: "text-secondary",
                      accentColor: "bg-secondary"
                    },
                    2: {
                      icon: Circle,
                      label: "Alternate Match",
                      bgColor: "bg-muted",
                      textColor: "text-muted-foreground",
                      accentColor: "bg-muted"
                    }
                  }[index];

                  const IconComponent = rankConfig.icon;

                  return (
                    <Card key={index} className="p-4 relative overflow-hidden">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <IconComponent className={`h-5 w-5 ${rankConfig.textColor}`} />
                              <span className="font-semibold text-lg">{type}</span>
                              <span className={`${rankConfig.bgColor} ${rankConfig.textColor} text-xs px-2 py-1 rounded-full font-medium ml-2`}>
                                {rankConfig.label}
                              </span>
                            </div>
                            
                            {personalityType && (
                              <>
                                <h4 className="font-semibold text-lg mt-2">{personalityType.title}</h4>
                                <p className="text-sm text-muted-foreground mt-2">{personalityType.who_they_are}</p>
                                
                                <div className="mt-4 space-y-4">
                                  <div>
                                    <h5 className="font-medium mb-2">Dichotomy Description</h5>
                                    <ul className="list-disc pl-5 space-y-1">
                                      {personalityType.dicotomy_description.map((desc, i) => (
                                        <li key={i} className="text-sm">{desc}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-medium mb-2">Key Traits</h5>
                                    <ul className="list-disc pl-5 space-y-1">
                                      {personalityType.traits.map((trait, i) => (
                                        <li key={i} className="text-sm">{trait}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-medium mb-2">Strengths</h5>
                                    <ul className="list-disc pl-5 space-y-1">
                                      {personalityType.strengths.map((strength, i) => (
                                        <li key={i} className="text-sm">{strength}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-medium mb-2">Potential Challenges</h5>
                                    <ul className="list-disc pl-5 space-y-1">
                                      {personalityType.weaknesses.map((weakness, i) => (
                                        <li key={i} className="text-sm">{weakness}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          <div className={`absolute top-0 right-0 h-full w-1.5 rounded-r-lg ${rankConfig.accentColor}`} />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
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

