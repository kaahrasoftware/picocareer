import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CareerDetailsDialog } from "./CareerDetailsDialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export interface CareerCardProps {
  id: string;
  title: string;
  description: string;
  salary_range?: string;
  image_url?: string;
  industry?: string;
  required_skills?: string[];
  stress_levels?: string;  // Changed from number to string to match DB
  featured?: boolean;
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
  featured
}: CareerCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card 
        className={`relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105 ${
          featured ? 'border-primary/50' : ''
        }`}
        onClick={() => setDialogOpen(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10" />
        {image_url ? (
          <img 
            src={image_url} 
            alt={title} 
            className="w-full h-48 object-cover" 
          />
        ) : (
          <div className="w-full h-48 bg-muted/50 flex items-center justify-center">
            <span className="text-muted-foreground">No image available</span>
          </div>
        )}
        
        <div className="relative z-20 p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold">{title}</h3>
              {featured && (
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {description}
            </p>
          </div>

          {stress_levels !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Stress Level</span>
                <span>{stress_levels}/10</span>
              </div>
              <Progress value={stress_levels * 10} className="h-1" />
            </div>
          )}

          <div className="flex justify-between items-end">
            <div className="space-y-1">
              {salary_range && (
                <span className="text-sm text-muted-foreground block">
                  {salary_range}
                </span>
              )}
              {industry && (
                <span className="text-xs text-muted-foreground block">
                  {industry}
                </span>
              )}
            </div>
            
            {required_skills && required_skills.length > 0 && (
              <div className="flex gap-2">
                {required_skills.slice(0, 2).map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="secondary"
                    className="bg-secondary/20 text-secondary text-xs"
                  >
                    {skill}
                  </Badge>
                ))}
                {required_skills.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{required_skills.length - 2}
                  </span>
                )}
              </div>
            )}
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