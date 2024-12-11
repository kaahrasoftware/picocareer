import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CareerDetailsDialog } from "./CareerDetailsDialog";

export interface CareerCardProps {
  id: number;
  title: string;
  description: string;
  users: string;
  salary: string;
  image_url: string;
  related_majors: string[];
  related_careers: string[];
  skills: string[];
  category?: string;
  level_of_study?: string;
  created_at?: string;
  featured?: boolean;
}

export function CareerCard(props: CareerCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card 
        className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105"
        onClick={() => setDialogOpen(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10" />
        <img src={props.image_url} alt={props.title} className="w-full h-48 object-cover" />
        <div className="relative z-20 p-4">
          <h3 className="text-xl font-bold mb-2">{props.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{props.description}</p>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{props.users} Users</span>
            <span>{props.salary}</span>
          </div>
        </div>
      </Card>
      <CareerDetailsDialog 
        career={props}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}