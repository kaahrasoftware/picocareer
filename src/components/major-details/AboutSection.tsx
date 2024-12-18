import { Lightbulb, GraduationCap } from "lucide-react";

interface AboutSectionProps {
  description: string;
  learning_objectives?: string[];
}

export function AboutSection({ description, learning_objectives }: AboutSectionProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-primary" />
        About this Major
      </h4>
      <p className="text-muted-foreground">{description}</p>
      
      {learning_objectives && learning_objectives.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Learning Objectives
          </h5>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {learning_objectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}