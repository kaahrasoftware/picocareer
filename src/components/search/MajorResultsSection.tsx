
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { GraduationCap } from "lucide-react";

interface MajorResultsSectionProps {
  majors: any[];
}

export const MajorResultsSection = ({ majors }: MajorResultsSectionProps) => {
  if (majors.length === 0) return null;

  return (
    <CommandGroup heading="Academic Majors">
      {majors.map((major) => (
        <CommandItem key={major.id} className="cursor-pointer">
          <GraduationCap className="mr-2 h-4 w-4 text-blue-500" />
          <div className="flex flex-col">
            <span className="font-medium">{major.title}</span>
            <span className="text-sm text-muted-foreground">
              {major.description?.substring(0, 100)}...
            </span>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
};
