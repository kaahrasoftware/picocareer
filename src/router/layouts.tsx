
import { MenuSidebar } from "@/components/MenuSidebar";
import { Footer } from "@/components/Footer";
import { GoToTopButton } from "@/components/ui/go-to-top-button";
import { Outlet } from "react-router-dom";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";

interface LayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: LayoutProps) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const isMentor = profile?.user_type === "mentor";

  return (
    <div className="min-h-screen flex flex-col">
      <MenuSidebar />
      <main className="pt-16 flex-grow">
        {children || <Outlet />}
      </main>
      <Footer />
      <GoToTopButton />
      {session && isMentor && <FloatingActionButton />}
    </div>
  );
}

export function AuthLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <MenuSidebar />
      <main className="pt-16 flex-grow">
        {children || <Outlet />} {/* Use children if provided, otherwise use Outlet */}
      </main>
    </div>
  );
}
