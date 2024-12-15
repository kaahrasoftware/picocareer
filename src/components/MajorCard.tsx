import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MajorDetailsDialog } from "./MajorDetailsDialog";

interface MajorCardProps {
  title: string;
  description: string;
  users?: string;
  imageUrl?: string;
  relatedCareers?: string[];
  requiredCourses?: string[];
  averageGPA?: string;
  image_url?: string;
  field_of_study?: string;
  degree_level?: string;
}

export function MajorCard(props: MajorCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Transform the data to match the expected format
  const majorData = {
    title: props.title,
    description: props.description,
    users: props.users || '0',
    imageUrl: props.imageUrl || props.image_url || '',
    relatedCareers: props.relatedCareers || [],
    requiredCourses: props.requiredCourses || [],
    averageGPA: props.averageGPA || 'N/A',
    fieldOfStudy: props.field_of_study,
    degreeLevel: props.degree_level
  };

  return (
    <>
      <Card 
        className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105"
        onClick={() => setDialogOpen(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10" />
        <img 
          src={majorData.imageUrl} 
          alt={majorData.title} 
          className="w-full h-48 object-cover" 
        />
        <div className="relative z-20 p-4">
          <h3 className="text-xl font-bold mb-2">{majorData.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{majorData.description}</p>
          <div className="flex justify-end text-sm text-muted-foreground">
            <span>{majorData.users} Users</span>
          </div>
        </div>
      </Card>
      <MajorDetailsDialog 
        major={majorData}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}