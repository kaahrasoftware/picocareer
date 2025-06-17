
import { HeroSection } from "@/components/sections/HeroSection";
import { StatisticsSection } from "@/components/sections/StatisticsSection";
import { MentorTabsSection } from "@/components/sections/mentor/MentorTabsSection";
import { FeaturedContentTabsSection } from "@/components/sections/FeaturedContentTabsSection";
import { ResourcesHighlightSection } from "@/components/sections/ResourcesHighlightSection";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { WelcomeDialog } from "@/components/guide/WelcomeDialog";
import { Slides } from "@/components/Slides";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ReferralDebugPanel } from "@/components/debug/ReferralDebugPanel";

const Index = () => {
  const { session } = useAuthSession();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    try {
      document.documentElement.classList.add("dark");
      
      // Check for referral code in URL
      const referralCode = searchParams.get('ref');
      if (referralCode) {
        console.log('Referral code detected in URL:', referralCode);
        
        // Store referral code in localStorage for persistence
        localStorage.setItem('referralCode', referralCode);
        
        // If user is not logged in, redirect to signup
        if (!session?.user) {
          toast.success('Welcome! You\'ve been referred by a friend. Let\'s create your account!');
          navigate('/auth?tab=signup');
          return;
        } else {
          // User is already logged in, show a message
          toast.info('You\'re already registered! Referral codes are for new users only.');
          // Clean up the URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('ref');
          window.history.replaceState({}, '', newUrl.toString());
        }
      }
    } catch (error) {
      console.error("Error setting dark theme:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, session, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-layout">
      <div className="main-content">
        <div className="w-full px-8 sm:px-12 lg:px-16 py-8">
          <div className="w-full max-w-7xl mx-auto space-y-16">
            <HeroSection />
            <StatisticsSection />
            <section className="mb-24">
              <Slides />
            </section>
            <ResourcesHighlightSection />
            <MentorTabsSection />
            <FeaturedContentTabsSection />
          </div>
        </div>
      </div>
      
      <WelcomeDialog />
      
      {/* Debug panel for development */}
      {process.env.NODE_ENV !== 'production' && <ReferralDebugPanel />}
    </div>
  );
};

export default Index;
