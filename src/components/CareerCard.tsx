import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CareerDetailsDialog } from "./CareerDetailsDialog";
import { CareerHeader } from "./career/CareerHeader";
import { BadgeSection } from "./career/BadgeSection";

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
  profiles_count?: number;
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
  profiles_count = 0,
}: CareerCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => setDialogOpen(true);

  return (
    <>
      <Card className="group relative overflow-hidden p-6 h-full flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-background opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex flex-col h-full">
          <CareerHeader 
            title={title}
            industry={industry}
            salary_range={salary_range}
            image_url={image_url}
            profiles_count={profiles_count}
            onImageClick={handleOpenDialog}
          />

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {description}
          </p>

          {required_education && required_education.length > 0 && (
            <BadgeSection
              title="Required Education"
              items={required_education}
              badgeClassName="bg-[#E5DEFF] text-[#4B5563] hover:bg-[#D8D1F2] transition-colors border border-[#D8D1F2]"
            />
          )}

          {academic_majors && academic_majors.length > 0 && (
            <BadgeSection
              title="Related Majors"
              items={academic_majors}
              badgeClassName="bg-[#FFDEE2] text-[#4B5563] hover:bg-[#FFD1D6] transition-colors border border-[#FFD1D6]"
            />
          )}

          {required_skills && required_skills.length > 0 && (
            <BadgeSection
              title="Required Skills"
              items={required_skills}
              badgeClassName="bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
            />
          )}

          {required_tools && required_tools.length > 0 && (
            <BadgeSection
              title="Required Tools"
              items={required_tools}
              badgeClassName="bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
            />
          )}

          <div className="mt-auto">
            <Button 
              variant="outline"
              className="w-full bg-background hover:bg-muted/50 transition-colors"
              onClick={handleOpenDialog}
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