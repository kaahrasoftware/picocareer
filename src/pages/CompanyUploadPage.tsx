
import { useAuthSession } from "@/hooks/useAuthSession";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { CompanyUploadForm } from "@/components/forms/company/CompanyUploadForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function CompanyUploadPage() {
  const { session } = useAuthSession();
  const { isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Add New Company</CardTitle>
            <CardDescription>
              Submit a new company to the PicoCareer database. 
              All submissions will be reviewed before publication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyUploadForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
