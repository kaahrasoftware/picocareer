import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CareerDetailsDialog } from "./CareerDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Briefcase } from "lucide-react";

export interface CareerCardProps {
  id: string;
  title: string;
  description: string;
  salary_range?: string;
  image_url?: string;
  industry?: string;
  required_skills?: string[];
  required_tools?: string[];
  required_education?: string[];
  academic_majors?: string[];
}

export function CareerCard({ 
  id, 
  title, 
  description, 
  salary_range, 
  image_url,
  industry,
  required_skills,
  required_tools,
  required_education,
  academic_majors,
}: CareerCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="group relative overflow-hidden p-6 h-full flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-background opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex flex-col h-full">
          {/* Header Section */}
          <div className="flex items-start gap-4 mb-4">
            {image_url ? (
              <div className="h-24 w-24 rounded-lg overflow-hidden ring-2 ring-background shadow-lg">
                <img 
                  src={image_url} 
                  alt={title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-24 w-24 rounded-lg bg-muted/50 flex items-center justify-center ring-2 ring-background shadow-lg">
                <Briefcase className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-1 break-words">{title}</h3>
              {industry && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Building2 className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{industry}</span>
                </div>
              )}
              {salary_range && (
                <Badge 
                  variant="outline" 
                  className="bg-[#FFDEE2] text-[#4B5563] mt-2"
                >
                  {salary_range}
                </Badge>
              )}
            </div>
          </div>

          {/* Description Section */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {description}
          </p>

          {/* Skills Section */}
          {required_skills && required_skills.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {required_skills.slice(0, 3).map((skill) => (
                  <Badge 
                    key={skill}
                    variant="outline"
                    className="bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                  >
                    {skill}
                  </Badge>
                ))}
                {required_skills.length > 3 && (
                  <Badge 
                    variant="outline"
                    className="bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                  >
                    +{required_skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Tools Section */}
          {required_tools && required_tools.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Required Tools</h4>
              <div className="flex flex-wrap gap-1.5">
                {required_tools.slice(0, 3).map((tool) => (
                  <Badge 
                    key={tool}
                    variant="outline"
                    className="bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
                  >
                    {tool}
                  </Badge>
                ))}
                {required_tools.length > 3 && (
                  <Badge 
                    variant="outline"
                    className="bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
                  >
                    +{required_tools.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Education Section */}
          {required_education && required_education.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Required Education</h4>
              <div className="flex flex-wrap gap-1.5">
                {required_education.slice(0, 3).map((education) => (
                  <Badge 
                    key={education}
                    variant="outline"
                    className="bg-[#E5DEFF] text-[#4B5563] hover:bg-[#D8D1F2] transition-colors border border-[#D8D1F2]"
                  >
                    {education}
                  </Badge>
                ))}
                {required_education.length > 3 && (
                  <Badge 
                    variant="outline"
                    className="bg-[#E5DEFF] text-[#4B5563] hover:bg-[#D8D1F2] transition-colors border border-[#D8D1F2]"
                  >
                    +{required_education.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Academic Majors Section */}
          {academic_majors && academic_majors.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Related Majors</h4>
              <div className="flex flex-wrap gap-1.5">
                {academic_majors.slice(0, 3).map((major) => (
                  <Badge 
                    key={major}
                    variant="outline"
                    className="bg-[#FFDEE2] text-[#4B5563] hover:bg-[#FFD1D6] transition-colors border border-[#FFD1D6]"
                  >
                    {major}
                  </Badge>
                ))}
                {academic_majors.length > 3 && (
                  <Badge 
                    variant="outline"
                    className="bg-[#FFDEE2] text-[#4B5563] hover:bg-[#FFD1D6] transition-colors border border-[#FFD1D6]"
                  >
                    +{academic_majors.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="mt-auto">
            <Button 
              variant="outline"
              className="w-full bg-background hover:bg-muted/50 transition-colors"
              onClick={() => setDialogOpen(true)}
            >
              View Details
            </Button>
          </div>
        </div>
      </Card>
      
      <CareerDetailsDialog 
        careerId={id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}