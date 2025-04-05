
import { MenuSidebar } from "@/components/MenuSidebar";
import { Footer } from "@/components/Footer";
import { GoToTopButton } from "@/components/ui/go-to-top-button";
import { Outlet, useLocation } from "react-router-dom";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { GuideProvider } from "@/context/GuideContext";
import { WelcomeDialog } from "@/components/guide/WelcomeDialog";
import { GuideButton } from "@/components/guide/GuideButton";
import { usePageLoading } from "@/hooks/usePageLoading";
import { LoadingBar } from "@/components/ui/loading-bar";

interface LayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: LayoutProps) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const isMentor = profile?.user_type === "mentor";
  const { isLoading } = usePageLoading();

  return (
    <GuideProvider>
      <div className="min-h-screen flex flex-col">
        <LoadingBar isLoading={isLoading} />
        <MenuSidebar />
        <main className="pt-16 flex-grow relative">
          {children || <Outlet />}
        </main>
        <Footer />
        <GoToTopButton />
        {session && isMentor && <FloatingActionButton />}
        <WelcomeDialog />
        <GuideButton floating={true} />
      </div>
    </GuideProvider>
  );
}

export function AuthLayout({ children }: LayoutProps) {
  const { isLoading } = usePageLoading();

  return (
    <div className="min-h-screen flex flex-col">
      <LoadingBar isLoading={isLoading} />
      <MenuSidebar />
      <main className="pt-16 flex-grow">
        {children || <Outlet />} {/* Use children if provided, otherwise use Outlet */}
      </main>
    </div>
  );
}
