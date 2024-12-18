import { Lightbulb, GraduationCap, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AboutSectionProps {
  description: string;
  learning_objectives?: string[];
  interdisciplinary_connections?: string[];
}

export function AboutSection({ 
  description, 
  learning_objectives,
  interdisciplinary_connections 
}: AboutSectionProps) {
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

      {interdisciplinary_connections && interdisciplinary_connections.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-primary" />
            Interdisciplinary Connections
          </h5>
          <div className="flex flex-wrap gap-2">
            {interdisciplinary_connections.map((connection, index) => (
              <Badge 
                key={index}
                variant="outline"
                className="bg-[#D3E4FD] text-[#4B5563]"
              >
                {connection}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}