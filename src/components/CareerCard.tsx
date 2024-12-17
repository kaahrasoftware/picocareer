import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CareerDetailsDialog } from "./CareerDetailsDialog";
import { Progress } from "@/components/ui/progress";

export interface CareerCardProps {
  id: string;
  title: string;
  description: string;
  salary_range?: string;
  average_salary?: number;
  image_url?: string;
  intensity?: number;
  stress_levels?: number;
  required_skills?: string[];
}

export function CareerCard({ 
  id, 
  title, 
  description, 
  salary_range, 
  average_salary, 
  image_url,
  intensity,
  stress_levels,
  required_skills 
}: CareerCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card 
        className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105"
        onClick={() => setDialogOpen(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10" />
        <img src={image_url} alt={title} className="w-full h-48 object-cover" />
        <div className="relative z-20 p-4 space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
          </div>

          {(intensity || stress_levels) && (
            <div className="space-y-2">
              {intensity && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Intensity</span>
                    <span>{intensity}/10</span>
                  </div>
                  <Progress value={intensity * 10} className="h-1" />
                </div>
              )}
              {stress_levels && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Stress Level</span>
                    <span>{stress_levels}/10</span>
                  </div>
                  <Progress value={stress_levels * 10} className="h-1" />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-end">
            <span className="text-sm text-muted-foreground">
              {salary_range || `$${average_salary?.toLocaleString()}`}
            </span>
            {required_skills && required_skills.length > 0 && (
              <div className="flex gap-2">
                {required_skills.slice(0, 2).map((skill) => (
                  <span 
                    key={skill} 
                    className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
                {required_skills.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{required_skills.length - 2}</span>
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