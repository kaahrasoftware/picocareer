import { useState } from "react";
import { Command } from "cmdk";
import { Card } from "@/components/ui/card";
import { CareerDetailsDialog } from "@/components/CareerDetailsDialog";
import { MajorDetailsDialog } from "@/components/MajorDetailsDialog";
import { MentorDetailsDialog } from "@/components/MentorDetailsDialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
  const [selectedCareer, setSelectedCareer] = useState<any>(null);
  const [selectedMajor, setSelectedMajor] = useState<any>(null);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);

  if (!isOpen) return null;

  return (
    <>
      <Card className="absolute top-full left-0 right-0 z-50 mt-2 bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg">
        <Command className="rounded-lg border-none bg-transparent">
          <Command.List className="max-h-[400px] overflow-y-auto p-4">
            {query.length > 0 ? (
              <div className="space-y-6">
                {/* Careers Section */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Careers</h3>
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-4 pb-4">
                      {careers?.length > 0 ? (
                        careers.map((career) => (
                          <Card 
                            key={career.id}
                            className="flex-none w-[200px] cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setSelectedCareer(career)}
                          >
                            <img 
                              src={career.image_url} 
                              alt={career.title}
                              className="w-full h-24 object-cover rounded-t-lg"
                            />
                            <div className="p-3">
                              <h4 className="font-medium truncate">{career.title}</h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {career.salary}
                              </p>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No careers found
                        </div>
                      )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>

                {/* Majors Section */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Majors</h3>
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-4 pb-4">
                      {majors?.length > 0 ? (
                        majors.map((major) => (
                          <Card 
                            key={major.id}
                            className="flex-none w-[200px] cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setSelectedMajor(major)}
                          >
                            <img 
                              src={major.image_url} 
                              alt={major.title}
                              className="w-full h-24 object-cover rounded-t-lg"
                            />
                            <div className="p-3">
                              <h4 className="font-medium truncate">{major.title}</h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {major.users} Students
                              </p>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No majors found
                        </div>
                      )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>

                {/* Mentors Section */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Mentors</h3>
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-4 pb-4">
                      {mentors?.length > 0 ? (
                        mentors.map((mentor) => (
                          <Card 
                            key={mentor.id}
                            className="flex-none w-[200px] cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setSelectedMentor(mentor)}
                          >
                            <img 
                              src={mentor.image_url} 
                              alt={mentor.name}
                              className="w-full h-24 object-cover rounded-t-lg"
                            />
                            <div className="p-3">
                              <h4 className="font-medium truncate">{mentor.name}</h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {mentor.title} at {mentor.company}
                              </p>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No mentors found
                        </div>
                      )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <Command.Empty className="py-6 text-center text-muted-foreground">
                Start typing to search...
              </Command.Empty>
            )}
          </Command.List>
        </Command>
      </Card>

      {/* Detail Dialogs */}
      {selectedCareer && (
        <CareerDetailsDialog
          career={selectedCareer}
          open={!!selectedCareer}
          onOpenChange={() => setSelectedCareer(null)}
        />
      )}
      
      {selectedMajor && (
        <MajorDetailsDialog
          major={selectedMajor}
          open={!!selectedMajor}
          onOpenChange={() => setSelectedMajor(null)}
        />
      )}
      
      {selectedMentor && (
        <MentorDetailsDialog
          mentor={selectedMentor}
          open={!!selectedMentor}
          onOpenChange={() => setSelectedMentor(null)}
        />
      )}
    </>
  );
}