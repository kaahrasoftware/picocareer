import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import type { CareerSearchResult } from "@/types/search";
import { CareerDetailsDialog } from "@/components/CareerDetailsDialog";
import { useState } from "react";

interface CareerSearchCardProps {
  result: CareerSearchResult;
  onClick?: (result: CareerSearchResult) => void;
}

export const CareerSearchCard = ({ result, onClick }: CareerSearchCardProps) => {
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);

  const handleClick = () => {
    if (onClick) {
      onClick(result);
      return;
    }
    setSelectedCareerId(result.id);
  };

  return (
    <>
      <Card
        className="flex flex-col p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white h-full"
        onClick={handleClick}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-[#FEF7CD]">
            <Building2 className="h-6 w-6 text-[#1A1F2C]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[#1A1F2C] truncate">{result.title}</p>
          </div>
        </div>
        <p className="text-sm text-[#8E9196] mb-3 line-clamp-2">{result.description}</p>
        {result.academic_majors && result.academic_majors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {result.academic_majors.slice(0, 3).map((major, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="bg-[#FEF7CD] text-[#1A1F2C] hover:bg-[#F97316]/10"
              >
                {major}
              </Badge>
            ))}
            {result.academic_majors.length > 3 && (
              <Badge 
                variant="secondary" 
                className="bg-[#FEF7CD] text-[#1A1F2C] hover:bg-[#F97316]/10"
              >
                +{result.academic_majors.length - 3}
              </Badge>
            )}
          </div>
        )}
      </Card>

      {selectedCareerId && (
        <CareerDetailsDialog
          careerId={selectedCareerId}
          open={!!selectedCareerId}
          onOpenChange={(open) => !open && setSelectedCareerId(null)}
        />
      )}
    </>
  );
};