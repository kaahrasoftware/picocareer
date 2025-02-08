
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PersonalityType } from "../ResultsSection";

interface PersonalityTabProps {
  typeDetails: PersonalityType;
  personalityTraits: string[];
}

export function PersonalityTab({ typeDetails, personalityTraits }: PersonalityTabProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">{typeDetails.title} ({typeDetails.type})</h3>
          <p className="text-sm text-muted-foreground mb-4">{typeDetails.who_they_are}</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Key Characteristics</h4>
          <ScrollArea className="h-[100px] rounded-md">
            <ul className="space-y-2">
              {typeDetails.dicotomy_description.map((trait: string, index: number) => (
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
                {typeDetails.strengths.map((strength: string, index: number) => (
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
                {typeDetails.weaknesses.map((weakness: string, index: number) => (
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
              {personalityTraits.map((trait: string, index: number) => (
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
  );
}
