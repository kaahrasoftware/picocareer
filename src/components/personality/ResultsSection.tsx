
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PersonalityTab } from "./tabs/PersonalityTab";
import { CareersTab } from "./tabs/CareersTab";
import { MajorsTab } from "./tabs/MajorsTab";
import { SkillsTab } from "./tabs/SkillsTab";

interface ResultsSectionProps {
  profileId: string;
}

interface TestResult {
  personality_traits: string[];
  career_matches: Array<{ title: string; reasoning: string }>;
  major_matches: Array<{ title: string; reasoning: string }>;
  skill_development: string[];
}

export type PersonalityType = {
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
      console.log('Starting personality test results fetch for profile:', profileId);
      
      if (!profileId) {
        console.error('No profile ID provided');
        throw new Error('Profile ID is required');
      }

      // First get dimension scores to identify personality type
      console.log('Fetching dimension scores...');
      const { data: dimensionScores, error: dimensionError } = await supabase
        .from('personality_dimension_scores')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dimensionError) {
        console.error('Error fetching dimension scores:', dimensionError);
        throw dimensionError;
      }

      if (!dimensionScores) {
        console.error('No dimension scores found for profile:', profileId);
        throw new Error('No dimension scores found');
      }

      console.log('Dimension scores:', dimensionScores);

      // Calculate personality type
      const personalityType = 
        (dimensionScores.e_i_score >= 0 ? 'E' : 'I') +
        (dimensionScores.s_n_score >= 0 ? 'S' : 'N') +
        (dimensionScores.t_f_score >= 0 ? 'T' : 'F') +
        (dimensionScores.j_p_score >= 0 ? 'J' : 'P');

      console.log('Calculated personality type:', personalityType);

      // Get personality type details
      console.log('Fetching personality type details...');
      const { data: typeDetails, error: typeError } = await supabase
        .from('personality_types')
        .select('*')
        .eq('type', personalityType)
        .maybeSingle();

      if (typeError) {
        console.error('Error fetching personality type details:', typeError);
        throw typeError;
      }

      if (!typeDetails) {
        console.error('No personality type details found for type:', personalityType);
        throw new Error(`Personality type ${personalityType} not found in database`);
      }

      console.log('Found personality type details:', typeDetails);

      // Get test results
      console.log('Fetching test results...');
      const { data: testResults, error: resultsError } = await supabase
        .from('personality_test_results')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (resultsError) {
        console.error('Error fetching test results:', resultsError);
        throw resultsError;
      }

      if (!testResults) {
        console.error('No test results found for profile:', profileId);
        throw new Error('No test results found');
      }

      console.log('Found test results:', testResults);
      
      try {
        const parsedResults: TestResult & { typeDetails: PersonalityType } = {
          personality_traits: JSON.parse(testResults.personality_traits || '[]'),
          career_matches: JSON.parse(testResults.career_matches || '[]'),
          major_matches: JSON.parse(testResults.major_matches || '[]'),
          skill_development: JSON.parse(testResults.skill_development || '[]'),
          typeDetails: typeDetails as PersonalityType
        };
        
        console.log('Successfully parsed results:', parsedResults);
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

  if (error) {
    console.error('Error in ResultsSection:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading results: {error.message}</p>
        <p className="mt-2">Please try taking the personality test again.</p>
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
          <PersonalityTab 
            typeDetails={results.typeDetails}
            personalityTraits={results.personality_traits}
          />
        </TabsContent>

        <TabsContent value="careers">
          <CareersTab careers={results.career_matches} />
        </TabsContent>

        <TabsContent value="majors">
          <MajorsTab majors={results.major_matches} />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsTab skills={results.skill_development} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
