import { Command } from "cmdk";
import { Card } from "@/components/ui/card";

interface SearchResultsProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  careers?: any[];
  majors?: any[];
  mentors?: any[];
}

export function SearchResults({ 
  query, 
  isOpen, 
  onClose,
  careers = [],
  majors = [],
  mentors = []
}: SearchResultsProps) {
  if (!isOpen) return null;

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-2 bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg">
      <Command className="rounded-lg border-none bg-transparent">
        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          {query.length > 0 ? (
            <>
              <Command.Group heading="Careers" className="pb-4">
                {careers?.length > 0 ? (
                  careers.map((career) => (
                    <Command.Item 
                      key={career.id} 
                      value={career.title}
                      className="px-4 py-2 rounded-md hover:bg-accent cursor-pointer"
                    >
                      {career.title}
                    </Command.Item>
                  ))
                ) : (
                  <Command.Item disabled className="px-4 py-2 text-muted-foreground">
                    No careers found
                  </Command.Item>
                )}
              </Command.Group>

              <Command.Group heading="Majors" className="pb-4">
                {majors?.length > 0 ? (
                  majors.map((major) => (
                    <Command.Item 
                      key={major.id} 
                      value={major.title}
                      className="px-4 py-2 rounded-md hover:bg-accent cursor-pointer"
                    >
                      {major.title}
                    </Command.Item>
                  ))
                ) : (
                  <Command.Item disabled className="px-4 py-2 text-muted-foreground">
                    No majors found
                  </Command.Item>
                )}
              </Command.Group>

              <Command.Group heading="Mentors" className="pb-4">
                {mentors?.length > 0 ? (
                  mentors.map((mentor) => (
                    <Command.Item 
                      key={mentor.id} 
                      value={mentor.name}
                      className="px-4 py-2 rounded-md hover:bg-accent cursor-pointer"
                    >
                      {mentor.name}
                    </Command.Item>
                  ))
                ) : (
                  <Command.Item disabled className="px-4 py-2 text-muted-foreground">
                    No mentors found
                  </Command.Item>
                )}
              </Command.Group>
            </>
          ) : (
            <Command.Empty className="py-6 text-center text-muted-foreground">
              Start typing to search...
            </Command.Empty>
          )}
        </Command.List>
      </Command>
    </Card>
  );
}