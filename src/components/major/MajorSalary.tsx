
import { DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MajorSalaryProps {
  potentialSalary?: string | null;
}

export function MajorSalary({ potentialSalary }: MajorSalaryProps) {
  if (!potentialSalary) return null;

  return (
    <div className="flex items-center gap-2 mb-4 text-sm">
      <DollarSign className="h-4 w-4 text-green-600" />
      <span className="text-muted-foreground">Potential Salary: </span>
      <Badge 
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200 font-semibold dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/60"
      >
        {potentialSalary}
      </Badge>
    </div>
  );
}
