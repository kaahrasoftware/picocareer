import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

interface SkillsListProps {
  skills: Array<{
    text: string;
    colorClass: string;
  }>;
}

export function SkillsList({ skills }: SkillsListProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex + 6 >= skills.length ? 0 : prevIndex + 1
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [skills.length]);

  const visibleSkills = [...skills.slice(currentIndex, currentIndex + 6)];
  if (visibleSkills.length < 6) {
    visibleSkills.push(...skills.slice(0, 6 - visibleSkills.length));
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-2">
        {visibleSkills.map((skill, index) => (
          <span
            key={`${skill.text}-${index}`}
            className={`px-2 py-0.5 rounded-full ${skill.colorClass} text-xs whitespace-nowrap transition-all duration-300 ease-in-out`}
          >
            {skill.text}
          </span>
        ))}
      </div>
    </ScrollArea>
  );
}