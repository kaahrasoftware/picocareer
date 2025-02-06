
import { useAuthSession } from "@/hooks/useAuthSession";
import { PersonalityTestForm } from "@/components/personality/PersonalityTestForm";
import { ResultsSection } from "@/components/personality/ResultsSection";
import { useSearchParams } from "react-router-dom";

export default function PersonalityTest() {
  const { session } = useAuthSession();
  const [searchParams] = useSearchParams();
  const showResults = searchParams.get('tab') === 'results';

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Career Personality Test</h1>
          {!showResults && (
            <p className="text-muted-foreground">
              Take this comprehensive assessment to discover career paths and academic programs 
              that align with your personality, skills, and interests.
            </p>
          )}
        </div>

        {showResults ? (
          <ResultsSection profileId={session?.user?.id || ''} />
        ) : (
          <PersonalityTestForm />
        )}
      </div>
    </div>
  );
}
