import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CareerDetailsDialog } from "./CareerDetailsDialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Briefcase } from "lucide-react";

export interface CareerCardProps {
  id: string;
  title: string;
  description: string;
  salary_range?: string;
  image_url?: string;
  industry?: string;
  required_skills?: string[];
  stress_levels?: string;
}

export function CareerCard({ 
  id, 
  title, 
  description, 
  salary_range, 
  image_url,
  industry,
  required_skills,
  stress_levels,
}: CareerCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Convert stress_levels string to number for Progress component
  const stressLevelValue = stress_levels ? parseInt(stress_levels, 10) : undefined;

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
              <h3 className="font-semibold truncate mb-1">{title}</h3>
              {industry && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Building2 className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{industry}</span>
                </div>
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
              <div className="flex flex-wrap gap-1.5">
                {required_skills.slice(0, 3).map((skill) => (
                  <Badge 
                    key={skill}
                    variant="secondary"
                    className="bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                  >
                    {skill}
                  </Badge>
                ))}
                {required_skills.length > 3 && (
                  <Badge 
                    variant="secondary"
                    className="bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
                  >
                    +{required_skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Stress Level & Salary Section */}
          <div className="mt-auto space-y-4">
            {stressLevelValue !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Stress Level</span>
                  <span>{stressLevelValue}/10</span>
                </div>
                <Progress value={stressLevelValue * 10} className="h-1" />
              </div>
            )}

            {salary_range && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>{salary_range}</span>
              </div>
            )}

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