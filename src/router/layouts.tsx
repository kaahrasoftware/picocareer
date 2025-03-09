
import { MenuSidebar } from "@/components/MenuSidebar";
import { Footer } from "@/components/Footer";
import { GoToTopButton } from "@/components/ui/go-to-top-button";
import { Outlet } from "react-router-dom";
import { Plus } from "lucide-react";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useState, useEffect } from "react";
import { AddContentDialog } from "@/components/profile-details/content/AddContentDialog";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Skeleton } from "@/components/ui/skeleton";

export function MainLayout({ children }: { children?: React.ReactNode }) {
  const { session } = useAuthSession();
  const { data: profile, isLoading, error } = useUserProfile(session);
  const [showAddContentDialog, setShowAddContentDialog] = useState(false);
  
  const handleContentAdded = () => {
    setShowAddContentDialog(false);
  };

  // Debug logs
  useEffect(() => {
    console.log("MainLayout - Session:", session?.user?.id);
    console.log("MainLayout - Profile:", profile);
    console.log("MainLayout - Is mentor:", profile?.user_type === "mentor");
    console.log("MainLayout - Profile loading:", isLoading);
    console.log("MainLayout - Profile error:", error);
  }, [session, profile, isLoading, error]);

  // Determine if the user is a mentor
  const isMentor = profile?.user_type === "mentor";

  // Added fallback checks and simpler loading state
  return (
    <div className="min-h-screen flex flex-col">
      <MenuSidebar />
      <main className="pt-16 flex-grow">
        {children || <Outlet />}
      </main>
      <Footer />
      <GoToTopButton />
      
      {session?.user && (
        <>
          {isLoading ? (
            // Show skeleton while loading
            <div className="fixed bottom-6 right-6 z-50">
              <Skeleton className="rounded-full w-14 h-14" />
            </div>
          ) : error ? (
            // Log error but don't show error UI
            console.error("Error loading profile:", error)
          ) : isMentor ? (
            // Show FAB for mentors
            <FloatingActionButton 
              icon={<Plus className="h-6 w-6 text-white" />} 
              onClick={() => setShowAddContentDialog(true)}
            />
          ) : null}
          
          {/* Only render dialog when needed */}
          {showAddContentDialog && session.user && isMentor && (
            <AddContentDialog
              open={showAddContentDialog}
              onOpenChange={setShowAddContentDialog}
              profileId={session.user.id}
              onContentAdded={handleContentAdded}
            />
          )}
        </>
      )}
    </div>
  );
}

export function AuthLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MenuSidebar />
      <main className="pt-16 flex-grow">
        {children || <Outlet />}
      </main>
    </div>
  );
}
