
import { SidebarProvider } from "@/components/ui/sidebar";
import { MenuSidebar } from "@/components/MenuSidebar";
import { ScholarshipHeader } from "@/components/scholarships/ScholarshipHeader";
import { ScholarshipFilters } from "@/components/scholarships/ScholarshipFilters";
import { ScholarshipGrid } from "@/components/scholarships/ScholarshipGrid";
import { useScholarshipFilters } from "@/hooks/useScholarshipFilters";
import { useScholarshipRefresh } from "@/hooks/useScholarshipRefresh";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ScholarshipDetailsDialog } from "@/components/scholarships/ScholarshipDetailsDialog";

export default function Scholarships() {
  const { refreshKey, refreshScholarships } = useScholarshipRefresh();
  const { 
    categories,
    scholarships,
    isLoading,
    handleFilterChange,
    resetFilters 
  } = useScholarshipFilters(refreshKey);

  const [dialogScholarship, setDialogScholarship] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle dialog opening from URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const dialogId = searchParams.get('dialog');
    
    if (dialogId) {
      // Load the scholarship details and open the dialog
      fetchScholarshipById(dialogId);
    } else {
      // Close dialog if no ID in URL
      setIsDialogOpen(false);
      setDialogScholarship(null);
    }
  }, [location.search]);

  // Fetch scholarship by ID for the dialog
  async function fetchScholarshipById(id: string) {
    try {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching scholarship:', error);
        return;
      }
      
      if (data) {
        setDialogScholarship(data);
        setIsDialogOpen(true);
      }
    } catch (err) {
      console.error('Failed to fetch scholarship:', err);
    }
  }

  // Handle dialog state changes
  function handleDialogOpenChange(open: boolean) {
    setIsDialogOpen(open);
    
    // If dialog is closed, remove the dialog parameter from the URL
    if (!open) {
      navigate('/scholarships', { replace: true });
    }
  }

  return (
    <SidebarProvider>
      <div className="app-layout">
        <MenuSidebar />
        <div className="main-content">
          <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full">
            <div className="space-y-8">
              <ScholarshipHeader onScrapingComplete={refreshScholarships} />
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                  <ScholarshipFilters
                    onFilterChange={handleFilterChange}
                    categories={categories}
                  />
                </div>
                
                <div className="lg:col-span-3">
                  <ScholarshipGrid
                    scholarships={scholarships}
                    isLoading={isLoading}
                    resetFilters={resetFilters}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scholarship details dialog */}
      {dialogScholarship && (
        <ScholarshipDetailsDialog
          scholarship={dialogScholarship}
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
        />
      )}
    </SidebarProvider>
  );
}
