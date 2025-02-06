
import { PersonalityTestForm } from "@/components/personality/PersonalityTestForm";

export default function PersonalityTest() {
  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Career Personality Test</h1>
          <p className="text-muted-foreground">
            Take this comprehensive assessment to discover career paths and academic programs 
            that align with your personality, skills, and interests.
          </p>
        </div>

        <PersonalityTestForm />
      </div>
    </div>
  );
}
