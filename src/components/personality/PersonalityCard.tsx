
import { PersonalityType } from "./types";
import { Card } from "@/components/ui/card";
import { Diamond, Square, Circle } from "lucide-react";

interface PersonalityCardProps {
  personalityType: PersonalityType;
  index: number;
}

export function PersonalityCard({ personalityType, index }: PersonalityCardProps) {
  // Define color configurations for each rank
  const rankConfig = {
    0: {
      icon: Diamond,
      label: "Primary Match",
      bgColor: "bg-[#9b87f5]/10", // Primary purple background
      textColor: "text-[#9b87f5]",
      accentColor: "bg-[#9b87f5]"
    },
    1: {
      icon: Square,
      label: "Secondary Match",
      bgColor: "bg-[#0EA5E9]/10", // Ocean blue background
      textColor: "text-[#0EA5E9]",
      accentColor: "bg-[#0EA5E9]"
    },
    2: {
      icon: Circle,
      label: "Alternate Match",
      bgColor: "bg-[#D946EF]/10", // Magenta pink background
      textColor: "text-[#D946EF]",
      accentColor: "bg-[#D946EF]"
    }
  }[index];

  const IconComponent = rankConfig.icon;

  return (
    <Card className={`p-4 relative overflow-hidden ${rankConfig.bgColor}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IconComponent className={`h-5 w-5 ${rankConfig.textColor}`} />
              <span className="font-semibold text-lg">{personalityType.type}</span>
              <span className={`${rankConfig.bgColor} ${rankConfig.textColor} text-xs px-2 py-1 rounded-full font-medium ml-2`}>
                {rankConfig.label}
              </span>
            </div>
            
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
          </div>
          <div className={`absolute top-0 right-0 h-full w-1.5 rounded-r-lg ${rankConfig.accentColor}`} />
        </div>
      </div>
    </Card>
  );
}
