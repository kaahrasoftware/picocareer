import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MajorDetailsDialog } from "./MajorDetailsDialog";

interface MajorCardProps {
  title: string;
  description: string;
  users: string;
  imageUrl: string;
  relatedCareers: string[];
  requiredCourses: string[];
  averageGPA: string;
}

export function MajorCard(props: MajorCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card 
        className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105"
        onClick={() => setDialogOpen(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-kahra-darker z-10" />
        <img src={props.imageUrl} alt={props.title} className="w-full h-48 object-cover" />
        <div className="relative z-20 p-4 text-white">
          <h3 className="text-xl font-bold mb-2">{props.title}</h3>
          <p className="text-sm text-gray-300 mb-4">{props.description}</p>
          <div className="flex justify-end text-sm text-gray-400">
            <span>{props.users} Users</span>
          </div>
        </div>
      </Card>
      <MajorDetailsDialog 
        major={props}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}