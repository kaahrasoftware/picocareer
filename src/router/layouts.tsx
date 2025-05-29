
import { Outlet } from 'react-router-dom';
import { MainNavigation } from '@/components/navigation/MainNavigation';
import { Footer } from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { GuideButton } from '@/components/guide/GuideButton';
import { GuideProvider } from "@/context/GuideContext"
import { WelcomeDialog } from "@/components/guide/WelcomeDialog"

export function MainLayout() {
  return (
    <GuideProvider>
      <div className="min-h-screen flex flex-col">
        <MainNavigation />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <ScrollToTop />
        <GuideButton floating />
        <WelcomeDialog />
      </div>
    </GuideProvider>
  );
}
