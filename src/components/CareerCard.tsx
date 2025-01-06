import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CareerDetailsDialog } from "./CareerDetailsDialog";
import { CareerHeader } from "./career/CareerHeader";
import { Briefcase, GraduationCap, Wrench, BookOpen } from "lucide-react";

interface CareerCardProps {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  industry?: string | null;
  salary_range?: string | null;
  required_education?: string[] | null;
  academic_majors?: string[] | null;
  required_skills?: string[] | null;
  required_tools?: string[] | null;
  profiles_count?: number;
}

export function CareerCard({
  id,
  title,
  description,
  image_url,
  industry,
  salary_range,
  required_education,
  academic_majors,
  required_skills,
  required_tools,
  profiles_count = 0,
}: CareerCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDialogOpen(true);
  };

  return (
    <>
      <Card 
        className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]" 
        onClick={handleOpenDialog}
      >
        <div className="p-4 space-y-4">
          <CareerHeader
            title={title}
            industry={industry}
            salary_range={salary_range}
            image_url={image_url}
            profiles_count={profiles_count}
            onImageClick={handleOpenDialog}
          />

          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          <div className="space-y-3">
            {required_education && required_education.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Required Education</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {required_education.slice(0, 2).map((edu, index) => (
                    <Badge 
                      key={`${edu}-${index}`}
                      variant="outline"
                      className="bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]"
                    >
                      {edu}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {academic_majors && academic_majors.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Related Majors</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {academic_majors.slice(0, 2).map((major, index) => (
                    <Badge 
                      key={`${major}-${index}`}
                      variant="outline"
                      className="bg-[#E3F2FD] text-[#1565C0] hover:bg-[#BBDEFB]"
                    >
                      {major}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleOpenDialog}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {dialogOpen && (
        <CareerDetailsDialog
          careerId={id}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </>
  );
}