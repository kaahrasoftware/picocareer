
import { GraduationCap, ExternalLink, Trophy, CheckSquare, MapPin, Building } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface SchoolsOfferingSectionProps {
  majorId: string;
}

interface SchoolOffering {
  program_details: string | null;
  program_url: string | null;
  schools: {
    id: string;
    name: string;
    logo_url?: string;
    cover_image_url?: string;
    location?: string;
    type?: string;
    ranking?: string;
    acceptance_rate?: number;
  };
}

export function SchoolsOfferingSection({ majorId }: SchoolsOfferingSectionProps) {
  const navigate = useNavigate();
  
  const { data: schoolsOffering, isLoading, error } = useQuery({
    queryKey: ['schools-offering-major', majorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('school_majors')
        .select(`
          program_details,
          program_url,
          schools:school_id (
            id,
            name,
            logo_url,
            cover_image_url,
            location,
            type,
            ranking,
            acceptance_rate
          )
        `)
        .eq('major_id', majorId);
        
      if (error) throw error;
      return data as SchoolOffering[];
    },
    enabled: !!majorId,
  });
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 h-32">
              <Skeleton className="h-12 w-12 rounded-full mx-auto mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-sm text-red-500">
        Error loading schools offering this major.
      </div>
    );
  }
  
  if (!schoolsOffering || schoolsOffering.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-primary" />
        Schools Offering This Major
        <Badge variant="outline" className="ml-2">{schoolsOffering.length}</Badge>
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {schoolsOffering.map((item, index) => (
          <Card 
            key={index} 
            className="overflow-hidden h-full flex flex-col hover:shadow-md transition-all duration-200 bg-card/50 backdrop-blur-sm border border-muted/30 cursor-pointer"
            onClick={() => navigate(`/school/${item.schools?.id}`)}
          >
            {/* Cover Image with Logo Overlay */}
            <div className="relative">
              <div className="w-full h-24 overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/10">
                {item.schools?.cover_image_url && (
                  <img 
                    src={item.schools.cover_image_url} 
                    alt={`${item.schools.name} campus`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                )}
              </div>
              
              {/* Logo overlay */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white bg-white flex items-center justify-center">
                  {item.schools?.logo_url ? (
                    <img 
                      src={item.schools.logo_url} 
                      alt={`${item.schools.name} logo`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <GraduationCap className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-3 pt-7 flex flex-col h-full">
              {/* School name */}
              <h5 className="font-semibold text-center line-clamp-1 mb-1">{item.schools?.name}</h5>
              
              <div className="text-xs text-muted-foreground space-y-0.5 mb-2">
                {item.schools?.location && (
                  <div className="flex items-center gap-1 justify-center">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="line-clamp-1">{item.schools.location}</span>
                  </div>
                )}
                
                {item.schools?.type && (
                  <div className="flex items-center gap-1 justify-center">
                    <Building className="h-3 w-3 flex-shrink-0" />
                    <span className="line-clamp-1 capitalize">{item.schools.type}</span>
                  </div>
                )}
              </div>
              
              {/* Ranking and Acceptance Rate */}
              <div className="grid grid-cols-2 gap-2 text-xs mt-auto mb-2 text-muted-foreground">
                {item.schools?.ranking && (
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-amber-500" />
                    <span>{item.schools.ranking} Ranking</span>
                  </div>
                )}
                {item.schools?.acceptance_rate !== null && item.schools?.acceptance_rate !== undefined && (
                  <div className="flex items-center gap-1 justify-end">
                    <CheckSquare className="h-3 w-3 text-green-500" />
                    <span>{Math.round(item.schools.acceptance_rate * 100)}% Acceptance</span>
                  </div>
                )}
              </div>
              
              {/* Program details indicator if available */}
              {item.program_details && (
                <div className="mt-auto pt-1">
                  <Badge variant="outline" className="text-xs w-full flex justify-center gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60">
                    {item.program_url ? (
                      <a 
                        href={item.program_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Program Details
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span>Has Program</span>
                    )}
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
