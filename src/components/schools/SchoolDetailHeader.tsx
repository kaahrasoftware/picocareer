
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { School, ArrowLeft } from "lucide-react";
import type { School as SchoolType } from "@/types/database/schools";

interface SchoolDetailHeaderProps {
  school: SchoolType;
}

export function SchoolDetailHeader({ school }: SchoolDetailHeaderProps) {
  return (
    <>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
          className="hover:bg-primary/10"
        >
          <Link to="/school" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schools
          </Link>
        </Button>
      </div>

      {/* School Header */}
      <div className="relative mb-16">
        {school.cover_image_url ? (
          <div className="w-full h-64 overflow-hidden rounded-lg shadow-md">
            <AspectRatio ratio={16/6}>
              <img
                src={school.cover_image_url}
                alt={school.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </AspectRatio>
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-primary/30 to-primary/10 rounded-lg shadow-md" />
        )}
        
        <div className="absolute -bottom-12 left-8 flex items-end">
          <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-background bg-background flex items-center justify-center shadow-lg">
            {school.logo_url ? (
              <img
                src={school.logo_url}
                alt={`${school.name} logo`}
                className="w-full h-full object-contain"
              />
            ) : (
              <School className="h-12 w-12 text-primary/60" />
            )}
          </div>
          <div className="bg-background py-2 px-4 rounded-tr-lg rounded-br-lg shadow-md">
            <h1 className="text-2xl font-bold">{school.name}</h1>
          </div>
        </div>
      </div>
    </>
  );
}
