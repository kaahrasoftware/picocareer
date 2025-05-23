
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePaginatedMajors } from "@/hooks/usePaginatedMajors";
import { MajorsDataTable } from "./MajorsDataTable";
import { MajorFormDialog } from "./MajorFormDialog";
import { Plus } from "lucide-react";

export function MajorsManagementTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [isAddMajorOpen, setIsAddMajorOpen] = useState(false);
  const [orderBy, setOrderBy] = useState("created_at");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");

  const {
    data: majors,
    isLoading,
    totalPages,
    totalCount,
    refetch
  } = usePaginatedMajors({
    page,
    limit: 10,
    searchQuery,
    orderBy,
    orderDirection,
    status
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === "all" ? undefined : value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setOrderBy(value);
  };

  const handleSortDirectionChange = (value: "asc" | "desc") => {
    setOrderDirection(value);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Majors Management</h2>
        <Button 
          onClick={() => setIsAddMajorOpen(true)} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Major
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="grow max-w-md">
          <Input
            placeholder="Search majors..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full"
          />
        </div>
        <Select value={status || "all"} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={orderBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="created_at">Creation Date</SelectItem>
            <SelectItem value="updated_at">Last Updated</SelectItem>
          </SelectContent>
        </Select>
        <Select value={orderDirection} onValueChange={handleSortDirectionChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <MajorsDataTable 
        majors={majors} 
        isLoading={isLoading} 
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onRefresh={refetch}
      />

      <MajorFormDialog
        open={isAddMajorOpen}
        onClose={() => setIsAddMajorOpen(false)}
        onSuccess={() => {
          setIsAddMajorOpen(false);
          refetch();
        }}
      />
    </Card>
  );
}
