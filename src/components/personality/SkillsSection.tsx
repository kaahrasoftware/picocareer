
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SkillsSectionProps {
  skills: string[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recommended Skill Development</h3>
      <ScrollArea className="h-[400px] rounded-md">
        <ul className="space-y-4">
          {skills.map((skill: string, index: number) => (
            <li key={index} className="flex items-start gap-2">
              <span className="font-medium text-sm mt-0.5">•</span>
              <span className="text-sm">{skill}</span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </Card>
  );
}
