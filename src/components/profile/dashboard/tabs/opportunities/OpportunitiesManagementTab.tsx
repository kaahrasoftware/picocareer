
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OpportunityWithAuthor } from "@/types/opportunity/types";
import { OpportunitiesDataTable } from "./OpportunitiesDataTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function OpportunitiesManagementTab() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityWithAuthor | null>(null);

  const { data: opportunities = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          profiles!opportunities_author_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(opp => ({
        ...opp,
        author: opp.profiles
      })) as OpportunityWithAuthor[];
    }
  });

  const handleEditOpportunity = (opportunityId: string) => {
    console.log('Edit opportunity:', opportunityId);
  };

  const handleDataChange = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Opportunities Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Opportunity
        </Button>
      </div>
      
      <OpportunitiesDataTable 
        opportunities={opportunities}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onEdit={handleEditOpportunity}
        onDelete={() => {}}
        onApprove={() => {}}
        onReject={() => {}}
        selectedStatuses={[]}
        onStatusFilterChange={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        sortField="created_at"
        sortDirection="desc"
        onSort={() => {}}
      />
    </div>
  );
}
