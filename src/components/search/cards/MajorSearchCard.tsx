import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";
import type { MajorSearchResult } from "@/types/search";
import { MajorDetails } from "@/components/MajorDetails";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MajorSearchCardProps {
  result: MajorSearchResult;
  onClick?: (result: MajorSearchResult) => void;
}

export const MajorSearchCard = ({ result, onClick }: MajorSearchCardProps) => {
  const [selectedMajorId, setSelectedMajorId] = useState<string | null>(null);

  const { data: selectedMajor, isLoading } = useQuery({
    queryKey: ['major', selectedMajorId],
    queryFn: async () => {
      if (!selectedMajorId) return null;
      
      const { data, error } = await supabase
        .from('majors')
        .select(`
          *,
          career_major_relations(
            career:careers(id, title, salary_range)
          )
        `)
        .eq('id', selectedMajorId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching major:', error);
        toast.error("Failed to load major details. Please try again.");
        return null;
      }
      
      return data;
    },
    enabled: !!selectedMajorId,
  });

  const handleClick = () => {
    if (onClick) {
      onClick(result);
      return;
    }
    setSelectedMajorId(result.id);
  };

  return (
    <>
      <Card
        className="flex flex-col p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white h-full"
        onClick={handleClick}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-[#F2FCE2]">
            <GraduationCap className="h-6 w-6 text-[#1A1F2C]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[#1A1F2C] truncate">{result.title}</p>
          </div>
        </div>
        {result.common_courses && result.common_courses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {result.common_courses.slice(0, 3).map((course, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="bg-[#F2FCE2] text-[#1A1F2C] hover:bg-[#E5F6D3]"
              >
                {course}
              </Badge>
            ))}
            {result.common_courses.length > 3 && (
              <Badge 
                variant="secondary" 
                className="bg-[#F2FCE2] text-[#1A1F2C] hover:bg-[#E5F6D3]"
              >
                +{result.common_courses.length - 3}
              </Badge>
            )}
          </div>
        )}
      </Card>

      {selectedMajor && !isLoading && (
        <MajorDetails
          major={selectedMajor}
          open={!!selectedMajor}
          onOpenChange={(open) => !open && setSelectedMajorId(null)}
        />
      )}
    </>
  );
};