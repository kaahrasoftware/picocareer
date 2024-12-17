import { DollarSign } from "lucide-react";

interface MajorSalaryProps {
  potentialSalary?: string;
}

export function MajorSalary({ potentialSalary }: MajorSalaryProps) {
  if (!potentialSalary) return null;

  return (
    <div className="mb-4 flex items-center gap-2 text-foreground/90">
      <DollarSign className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">
        Potential Salary: {potentialSalary}
      </span>
    </div>
  );
}