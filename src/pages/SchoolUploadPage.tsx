
import { useAuthSession } from "@/hooks/useAuthSession";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { SchoolUploadForm } from "@/components/forms/school/SchoolUploadForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function SchoolUploadPage() {
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
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Add New School</CardTitle>
            <CardDescription>
              Submit a new educational institution to the PicoCareer database. 
              All submissions will be reviewed before publication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SchoolUploadForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
