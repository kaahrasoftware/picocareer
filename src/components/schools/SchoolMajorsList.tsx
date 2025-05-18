
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SchoolMajor {
  major_id: string;
  program_details: string | null;
  program_url: string | null;
  major_title: string;
  degree_levels: string[] | null;
}

interface SchoolMajorsListProps {
  schoolId: string;
}

export function SchoolMajorsList({ schoolId }: SchoolMajorsListProps) {
  const [majors, setMajors] = useState<SchoolMajor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    if (schoolId) {
      fetchSchoolMajors();
    }
  }, [schoolId]);

  const fetchSchoolMajors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('school_majors')
        .select(`
          major_id,
          program_details,
          program_url,
          majors (
            title,
            degree_levels
          )
        `)
        .eq('school_id', schoolId);

      if (error) throw error;

      const formattedData = data.map(item => ({
        major_id: item.major_id,
        program_details: item.program_details,
        program_url: item.program_url,
        major_title: item.majors?.title || 'Unknown Program',
        degree_levels: item.majors?.degree_levels || []
      }));

      setMajors(formattedData);
    } catch (error) {
      console.error('Error fetching school majors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load programs. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2 mt-1">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-7 w-20" />
            </div>
            <Skeleton className="h-px w-full mt-3" />
          </div>
        ))}
      </div>
    );
  }

  if (majors.length === 0) {
    return (
      <div className="text-center py-10">
        <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No programs available for this school yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {majors.map((major) => (
        <div key={major.major_id} className="pb-4 border-b last:border-b-0 last:pb-0">
          <h3 className="text-lg font-medium">{major.major_title}</h3>
          
          {major.program_details && (
            <p className="text-sm text-muted-foreground mt-1">{major.program_details}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-3">
            {major.degree_levels?.map((level) => (
              <Badge key={level} variant="outline">
                {level}
              </Badge>
            ))}
            
            {major.program_url && (
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-1"
                asChild
              >
                <a href={major.program_url} target="_blank" rel="noopener noreferrer">
                  Program Website
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
