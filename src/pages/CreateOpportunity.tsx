
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
  const { session } = useAuthSession();
  const { createOpportunity, isLoading } = useCreateOpportunity();
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (!session) {
    toast({
      title: "Authentication required",
      description: "You must be signed in to create an opportunity",
      variant: "destructive",
    });
    navigate("/auth");
    return null;
  }

  const handleSubmit = async (data: any) => {
    try {
      setFormError(null);
      const result = await createOpportunity(data);
      
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
