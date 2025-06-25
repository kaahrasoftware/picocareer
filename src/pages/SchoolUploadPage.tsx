
import { useAuthSession } from "@/hooks/useAuthSession";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { SchoolUploadForm } from "@/components/forms/school/SchoolUploadForm";
import { SchoolUpdateTab } from "@/components/forms/school/SchoolUpdateTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
            <CardTitle className="text-2xl font-bold">School Management</CardTitle>
            <CardDescription>
              Add new schools or update existing ones with AI-powered data fetching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="add" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add">Add New School</TabsTrigger>
                <TabsTrigger value="update">Update Existing Schools</TabsTrigger>
              </TabsList>
              
              <TabsContent value="add" className="mt-6">
                <SchoolUploadForm />
              </TabsContent>
              
              <TabsContent value="update" className="mt-6">
                <SchoolUpdateTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
