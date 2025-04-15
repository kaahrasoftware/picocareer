
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OpportunityForm } from "@/components/opportunity/OpportunityForm";
import { useCreateOpportunity } from "@/hooks/useCreateOpportunity";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CreateOpportunity() {
  const navigate = useNavigate();
  const { session, loading } = useAuthSession('required');
  const { createOpportunity, isLoading } = useCreateOpportunity();
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If session is null after loading is done, the user will be redirected automatically
  // by the useAuthSession hook with 'required' parameter

  const handleSubmit = async (data: any) => {
    try {
      setFormError(null);
      
      // Ensure author_id is set to the current user's ID
      const opportunityData = {
        ...data,
        author_id: session!.user.id,
        // Set default status to 'Pending' when creating
        status: 'Pending'
      };
      
      const result = await createOpportunity(opportunityData);
      
      if (result?.id) {
        toast({
          title: "Success",
          description: "Your opportunity has been created and is pending approval",
        });
        navigate(`/opportunities/${result.id}`);
      }
    } catch (error: any) {
      console.error("Error creating opportunity:", error);
      setFormError(error.message || "Failed to create opportunity. Please try again.");
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-1"
        onClick={() => navigate("/opportunities")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Opportunities
      </Button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Opportunity</h1>
        
        {formError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
            {formError}
          </div>
        )}
        
        <OpportunityForm 
          onSubmit={handleSubmit} 
          isSubmitting={isLoading} 
        />
      </div>
    </div>
  );
}
