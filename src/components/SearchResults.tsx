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
    <Card className="absolute top-full left-0 right-0 z-50 mt-2">
      <Command>
        <Command.List>
          {query.length > 0 ? (
            <>
              <Command.Group heading="Careers">
                {careers.length > 0 ? (
                  careers.map((career) => (
                    <Command.Item key={career.id} value={career.title}>
                      {career.title}
                    </Command.Item>
                  ))
                ) : (
                  <Command.Item disabled>No careers found</Command.Item>
                )}
              </Command.Group>

              <Command.Group heading="Majors">
                {majors.length > 0 ? (
                  majors.map((major) => (
                    <Command.Item key={major.id} value={major.title}>
                      {major.title}
                    </Command.Item>
                  ))
                ) : (
                  <Command.Item disabled>No majors found</Command.Item>
                )}
              </Command.Group>

              <Command.Group heading="Mentors">
                {mentors.length > 0 ? (
                  mentors.map((mentor) => (
                    <Command.Item key={mentor.id} value={mentor.name}>
                      {mentor.name}
                    </Command.Item>
                  ))
                ) : (
                  <Command.Item disabled>No mentors found</Command.Item>
                )}
              </Command.Group>
            </>
          ) : (
            <Command.Empty>Start typing to search...</Command.Empty>
          )}
        </Command.List>
      </Command>
    </Card>
  );
}