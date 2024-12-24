import { Progress } from "@/components/ui/progress";

interface CareerMetricsProps {
  intensity?: string | null;
  stress_levels?: string | null;
  dropout_rates?: string | null;
  average_salary?: string;
  potential_salary?: string;
  tuition_and_fees?: string;
}

export function CareerMetrics({
  intensity,
  stress_levels,
  dropout_rates,
  average_salary,
  potential_salary,
  tuition_and_fees
}: CareerMetricsProps) {
  const renderMetricBar = (value: string | null, label: string) => {
    if (value === null) return null;
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) return null;
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span>{numericValue}/10</span>
        </div>
        <Progress value={numericValue * 10} className="h-2" />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">Career Metrics</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {average_salary && (
          <div className="text-sm">
            <span className="text-muted-foreground">Average Salary:</span>
            <span className="ml-2">{average_salary}</span>
          </div>
        )}
        {potential_salary && (
          <div className="text-sm">
            <span className="text-muted-foreground">Potential Salary:</span>
            <span className="ml-2">{potential_salary}</span>
          </div>
        )}
        {tuition_and_fees && (
          <div className="text-sm">
            <span className="text-muted-foreground">Tuition & Fees:</span>
            <span className="ml-2">{tuition_and_fees}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {renderMetricBar(intensity?.toString(), "Career Intensity")}
        {renderMetricBar(stress_levels, "Stress Levels")}
        {dropout_rates && (
          <div className="text-sm">
            <span className="text-muted-foreground">Dropout Rate:</span>
            <span className="ml-2">{dropout_rates}</span>
          </div>
        )}
      </div>
    </div>
  );
}