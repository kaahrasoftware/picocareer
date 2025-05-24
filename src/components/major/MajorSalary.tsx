
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
        className="bg-red-50 text-red-800 border-red-200 font-medium dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/40"
      >
        {potentialSalary}
      </Badge>
    </div>
  );
}
