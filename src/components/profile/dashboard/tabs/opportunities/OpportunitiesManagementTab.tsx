
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { OpportunitiesDataTable } from "./OpportunitiesDataTable";
import { useAdminOpportunitiesQuery } from "@/hooks/useAdminOpportunitiesQuery";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function OpportunitiesManagementTab() {
  const navigate = useNavigate();
  const { data: opportunities, isLoading, error, refetch } = useAdminOpportunitiesQuery();

  const handleCreateOpportunity = () => {
    navigate("/create-opportunity");
  };

  const handleEditOpportunity = (opportunity: any) => {
    // Navigate to edit page when available
    console.log("Edit opportunity:", opportunity.id);
  };

  // Map the data to match the expected format for the data table
  const mappedOpportunities = opportunities?.map(opp => ({
    ...opp,
    type: opp.opportunity_type || 'other',
    provider_name: opp.provider_name || 'N/A'
  })) || [];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Opportunities Management</h2>
          <Button onClick={handleCreateOpportunity}>
            <Plus className="h-4 w-4 mr-2" />
            Add Opportunity
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading opportunities: {error.message}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="ml-2"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Opportunities Management</h2>
          {!isLoading && (
            <p className="text-muted-foreground">
              {mappedOpportunities.length} opportunities total
            </p>
          )}
        </div>
        <Button onClick={handleCreateOpportunity}>
          <Plus className="h-4 w-4 mr-2" />
          Add Opportunity
        </Button>
      </div>
      
      <OpportunitiesDataTable 
        opportunities={mappedOpportunities}
        onEdit={handleEditOpportunity}
        isLoading={isLoading}
      />
    </div>
  );
}
