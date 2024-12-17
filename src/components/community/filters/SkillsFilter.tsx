import { useRef, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillsFilterProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  allSkills: string[];
  skillSearchQuery: string;
  onSkillSearchChange: (value: string) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SkillsFilter({
  selectedSkills,
  onSkillsChange,
  allSkills,
  skillSearchQuery,
  onSkillSearchChange,
  isOpen,
  onOpenChange,
}: SkillsFilterProps) {
  const commandRef = useRef<HTMLDivElement>(null);
  const filteredSkills = allSkills.filter(skill => 
    skill.toLowerCase().includes(skillSearchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onOpenChange]);

  return (
    <Command className="rounded-lg border shadow-md" ref={commandRef}>
      <CommandInput 
        placeholder="Search skills..." 
        value={skillSearchQuery}
        onValueChange={onSkillSearchChange}
        onFocus={() => onOpenChange(true)}
      />
      {isOpen && (
        <CommandList>
          <CommandGroup>
            <div className="flex flex-wrap gap-1 p-2">
              {selectedSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="mr-1 mb-1 cursor-pointer"
                  onClick={() => onSkillsChange(selectedSkills.filter(s => s !== skill))}
                >
                  {skill} ×
                </Badge>
              ))}
            </div>
            {filteredSkills.length === 0 && (
              <CommandEmpty>No skills found.</CommandEmpty>
            )}
            {filteredSkills.map((skill) => (
              <CommandItem
                key={skill}
                onSelect={() => {
                  if (selectedSkills.includes(skill)) {
                    onSkillsChange(selectedSkills.filter(s => s !== skill));
                  } else {
                    onSkillsChange([...selectedSkills, skill]);
                  }
                  onSkillSearchChange("");
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedSkills.includes(skill) ? "opacity-100" : "opacity-0"
                  )}
                />
                {skill}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      )}
    </Command>
  );
}