
import { MenuSidebar } from "@/components/MenuSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ScholarshipForm } from "@/components/scholarships/ScholarshipForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ScholarshipAdd() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only perform redirect check when auth loading is complete
    if (!loading) {
      // Short timeout to ensure auth state is fully initialized
      const timer = setTimeout(() => {
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please sign in to add a scholarship.",
            variant: "destructive",
          });
          navigate("/scholarships");
        }
        setIsChecking(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate, toast]);

  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking authentication...</span>
      </div>
    );
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
