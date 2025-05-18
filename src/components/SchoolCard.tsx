
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, MapPin, Globe, Building } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { School } from "@/types/database/schools";

interface SchoolCardProps {
  school: School;
  compact?: boolean;
}

export function SchoolCard({ school, compact = false }: SchoolCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/school/${school.id}`);
  };

  return (
    <Card className="group overflow-hidden h-full flex flex-col hover:shadow-md transition-all duration-200 cursor-pointer" onClick={handleViewDetails}>
      <div className="relative">
        {school.cover_image_url && (
          <div className="w-full h-36 overflow-hidden">
            <img
              src={school.cover_image_url}
              alt={school.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
            />
          </div>
        )}
        {school.logo_url && (
          <div className={`absolute ${school.cover_image_url ? '-bottom-8 left-4' : 'top-4 left-4'}`}>
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white bg-white flex items-center justify-center">
              <img
                src={school.logo_url}
                alt={`${school.name} logo`}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      <div className={`p-4 flex-1 flex flex-col ${school.cover_image_url ? 'pt-10' : ''}`}>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-2">{school.name}</h3>
            <Badge variant="outline" className="capitalize text-xs">
              {school.type || 'School'}
            </Badge>
          </div>

          {!compact && (
            <>
              <div className="space-y-1 mb-4 text-muted-foreground text-sm">
                {school.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="line-clamp-1">{school.location}</span>
                  </div>
                )}
                
                {school.type && (
                  <div className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="line-clamp-1 capitalize">{school.type}</span>
                  </div>
                )}
                
                {school.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                    <a 
                      href={school.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="line-clamp-1 hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {school.website.replace(/(^\w+:|^)\/\//, '')}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {school.acceptance_rate !== null && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(school.acceptance_rate * 100)}% Acceptance
                  </Badge>
                )}
                
                {school.ranking && (
                  <Badge variant="secondary" className="text-xs">
                    {school.ranking} Ranking
                  </Badge>
                )}
                
                {school.student_faculty_ratio && (
                  <Badge variant="secondary" className="text-xs">
                    {school.student_faculty_ratio} Student-Faculty Ratio
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-auto pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/school/${school.id}`);
            }}
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
