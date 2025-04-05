
import { MenuSidebar } from "@/components/MenuSidebar";
import { Footer } from "@/components/Footer";
import { GoToTopButton } from "@/components/ui/go-to-top-button";
import { Outlet } from "react-router-dom";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { GuideProvider } from "@/context/GuideContext";
import { WelcomeDialog } from "@/components/guide/WelcomeDialog";
import { GuideButton } from "@/components/guide/GuideButton";
import { LoadingProvider } from "@/context/LoadingContext";
import { PageTransitionLoader } from "@/components/PageTransitionLoader";

interface LayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: LayoutProps) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const isMentor = profile?.user_type === "mentor";

  return (
    <LoadingProvider>
      <GuideProvider>
        <div className="min-h-screen flex flex-col">
          <MenuSidebar />
          <PageTransitionLoader />
          <main className="pt-16 flex-grow">
            {children || <Outlet />}
          </main>
          <Footer />
          <GoToTopButton />
          {session && isMentor && <FloatingActionButton />}
          <WelcomeDialog />
          <GuideButton floating={true} />
        </div>
      </GuideProvider>
    </LoadingProvider>
  );
}

export function AuthLayout({ children }: LayoutProps) {
  return (
    <LoadingProvider>
      <div className="min-h-screen flex flex-col">
        <MenuSidebar />
        <PageTransitionLoader />
        <main className="pt-16 flex-grow">
          {children || <Outlet />}
        </main>
      </div>
    </LoadingProvider>
  );
}
