import { DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MajorSalaryProps {
  potentialSalary?: string | null;
}

export function MajorSalary({ potentialSalary }: MajorSalaryProps) {
  if (!potentialSalary) return null;

  return (
    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
      <DollarSign className="h-4 w-4" />
      <span>Potential Salary: </span>
      <Badge 
        variant="outline"
        className="bg-[#F2FCE2] text-picocareer-dark border-[#E2EFD9] font-semibold"
      >
        {potentialSalary}
      </Badge>
    </div>
  );
}