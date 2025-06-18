
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Edit, Trash2, Search, Check, X } from "lucide-react";
import { OpportunityWithAuthor } from "@/types/opportunity/types";

interface OpportunitiesDataTableProps {
  opportunities: OpportunityWithAuthor[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onEdit: (opportunityId: string) => void;
  onDelete: (opportunityId: string) => void;
  onApprove: (opportunityId: string) => void;
  onReject: (opportunityId: string) => void;
}

export function OpportunitiesDataTable({
  opportunities,
  isLoading,
  isError,
  error,
  onEdit,
  onDelete,
  onApprove,
  onReject
}: OpportunitiesDataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opportunity.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || opportunity.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div>Loading opportunities...</div>;
  }

  if (isError) {
    return <div>Error loading opportunities: {error?.message}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Opportunities Grid */}
      {filteredOpportunities.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No opportunities found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {opportunity.company || 'N/A'} | {opportunity.location || 'Remote'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(opportunity.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onApprove(opportunity.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReject(opportunity.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(opportunity.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-2">{opportunity.description}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  Status: {opportunity.status} | Category: {opportunity.category || 'General'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
