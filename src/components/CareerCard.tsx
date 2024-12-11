import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CareerDetailsDialog } from "./CareerDetailsDialog";
import { Career, careerToCareerDetails } from "@/types/career";

export function CareerCard(props: Career) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const careerDetails = careerToCareerDetails(props);

  return (
    <>
      <Card 
        className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105"
        onClick={() => setDialogOpen(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background/90 z-10" />
        <img src={props.image_url} alt={props.title} className="w-full h-48 object-cover" />
        <div className="relative z-20 p-6">
          <h3 className="text-2xl font-semibold mb-2 text-white">{props.title}</h3>
          <p className="text-sm text-gray-200 mb-4 line-clamp-2">{props.description}</p>
          <div className="flex justify-between text-sm text-gray-300">
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              {props.users}
            </span>
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              {props.salary}
            </span>
          </div>
        </div>
      </Card>
      <CareerDetailsDialog 
        career={careerDetails}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}