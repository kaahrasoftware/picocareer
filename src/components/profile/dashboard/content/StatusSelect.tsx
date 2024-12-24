import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentStatus } from "../types";

interface StatusSelectProps {
  status: ContentStatus | "all";
  onStatusChange: (value: ContentStatus) => void;
  getStatusColor: (status: ContentStatus) => string;
}

export function StatusSelect({ status, onStatusChange, getStatusColor }: StatusSelectProps) {
  return (
    <Select
      value={status}
      onValueChange={(value) => onStatusChange(value as ContentStatus)}
    >
      <SelectTrigger className={`w-[120px] border ${getStatusColor(status as ContentStatus)}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Approved">Approved</SelectItem>
        <SelectItem value="Pending">Pending</SelectItem>
        <SelectItem value="Rejected">Rejected</SelectItem>
      </SelectContent>
    </Select>
  );
}