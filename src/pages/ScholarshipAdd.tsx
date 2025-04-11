
import { MenuSidebar } from "@/components/MenuSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ScholarshipForm } from "@/components/scholarships/ScholarshipForm";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ScholarshipAdd() {
  const { user, isLoading } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add a scholarship.",
        variant: "destructive",
      });
      navigate("/scholarships");
    }
  }, [user, isLoading, navigate, toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <div className="app-layout">
        <MenuSidebar />
        <div className="main-content">
          <div className="px-4 md:px-8 py-8 max-w-5xl mx-auto w-full">
            <h1 className="text-3xl font-bold mb-8">Add Scholarship</h1>
            <div className="bg-card border rounded-lg shadow-sm p-6">
              <ScholarshipForm />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
