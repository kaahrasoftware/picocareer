import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ContentStatus } from "../types";

interface ContentStatusFilterProps {
  statusFilter: ContentStatus | "all";
  onStatusFilterChange: (value: ContentStatus | "all") => void;
}

export function ContentStatusFilter({ statusFilter, onStatusFilterChange }: ContentStatusFilterProps) {
  return (
    <div className="mb-4">
      <Select
        value={statusFilter}
        onValueChange={(value) => onStatusFilterChange(value as ContentStatus | "all")}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Approved">Approved</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}