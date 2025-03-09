
import { MenuSidebar } from "@/components/MenuSidebar";
import { Footer } from "@/components/Footer";
import { GoToTopButton } from "@/components/ui/go-to-top-button";
import { Outlet } from "react-router-dom";
import { Plus } from "lucide-react";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useState } from "react";
import { AddContentDialog } from "@/components/profile-details/content/AddContentDialog";
import { useAuthSession } from "@/hooks/useAuthSession";

interface LayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: LayoutProps) {
  const { session } = useAuthSession();
  const [showAddContentDialog, setShowAddContentDialog] = useState(false);
  
  const handleContentAdded = () => {
    setShowAddContentDialog(false);
  };

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
          <FloatingActionButton 
            icon={<Plus className="h-6 w-6" />} 
            onClick={() => setShowAddContentDialog(true)}
          />
          
          {showAddContentDialog && (
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

export function AuthLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <MenuSidebar />
      <main className="pt-16 flex-grow">
        {children || <Outlet />}
      </main>
    </div>
  );
}
