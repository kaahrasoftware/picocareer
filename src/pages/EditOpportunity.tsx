
import { useParams, useNavigate } from "react-router-dom";
import { OpportunityForm } from "@/components/opportunity/OpportunityForm";
import { useOpportunityForEdit } from "@/hooks/useOpportunityForEdit";
import { useUpdateOpportunityMutation } from "@/hooks/useUpdateOpportunityMutation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditOpportunity() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: opportunity, isLoading, error } = useOpportunityForEdit(id!);
  const updateMutation = useUpdateOpportunityMutation();

  const handleSubmit = async (data: any) => {
    if (!id) return;

    await updateMutation.mutateAsync({
      id,
      data: {
        ...data,
        updated_at: new Date().toISOString(),
      },
    });

    navigate("/dashboard");
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>
              Failed to load opportunity data. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Opportunity Not Found</CardTitle>
            <CardDescription>
              The opportunity you're looking for doesn't exist or you don't have permission to edit it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Opportunity</h1>
            <p className="text-muted-foreground">
              Update the details for "{opportunity.title}"
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Opportunity Details</CardTitle>
            <CardDescription>
              Make changes to the opportunity information below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OpportunityForm
              initialData={opportunity}
              onSubmit={handleSubmit}
              isSubmitting={updateMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
