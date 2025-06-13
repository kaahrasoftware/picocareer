
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Slides } from "@/components/Slides";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Users, Heart, Trophy, ArrowRight } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { AuthPromptDialog } from "@/components/auth/AuthPromptDialog";
import { cn } from "@/lib/utils";

export const HeroSection = () => {
  const { session } = useAuthSession();
  const navigate = useNavigate();
  const isLoggedIn = !!session?.user;
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const handleBecomeMentorClick = () => {
    if (isLoggedIn) {
      navigate('/mentor-registration');
    } else {
      setIsAuthDialogOpen(true);
    }
  };

  return (
    <div className="relative isolate overflow-visible">
      {/* Hero Section - Title and Description */}
      <section className="text-center mb-12">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 flex items-center justify-center flex-wrap gap-2 text-black">
            The <span style={{ color: '#00A6D4' }}>All-in-One</span> Platform for International Students
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Navigate your educational and career journey with confidence, backed by expert guidance and personalized support
          </p>
        </div>
      </section>

      {/* Header with Search */}
      <header className="flex justify-between items-center mb-16 relative bg-white/30 backdrop-filter backdrop-blur-lg rounded-xl p-6">
        <div className="w-full SearchBar">
          <SearchBar 
            placeholder="find mentor, academic programs, careers, universities, scholarships..." 
            isSearchDialogOpen={isSearchDialogOpen}
            onSearchDialogChange={setIsSearchDialogOpen}
          />
        </div>
      </header>
      
      {/* Modern CTA Section */}
      <section className={cn(
        "mb-12 transition-all duration-300 ease-in-out",
        isSearchDialogOpen 
          ? "opacity-0 pointer-events-none translate-y-4" 
          : "opacity-100 pointer-events-auto translate-y-0"
      )}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 md:p-12">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Find Your Perfect Mentor
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Connect with experts who've walked the path you aspire to follow
                </p>
              </div>

              {/* Benefits */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Expert Guidance</span>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Career Success</span>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Personal Support</span>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                {isLoggedIn ? (
                  <Button
                    asChild
                    size="lg"
                    className="bg-[#00A6D4] hover:bg-[#0095c1] text-white font-medium px-8 py-6 h-auto text-lg transition-colors"
                  >
                    <Link to="/mentor" className="flex items-center gap-2">
                      Find a Mentor
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    onClick={handleBecomeMentorClick}
                    size="lg"
                    className="bg-[#00A6D4] hover:bg-[#0095c1] text-white font-medium px-8 py-6 h-auto text-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Become a Mentee
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </Button>
                )}
                
                <p className="text-gray-500 text-sm mt-4">
                  {isLoggedIn ? "Browse our expert mentors" : "Free sign-up • Start your journey today"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthPromptDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        title="Join Our Mentor Community"
        description="Create an account or sign in to register as a mentor and start helping students achieve their dreams."
        redirectUrl="/mentor-registration"
      />
    </div>
  );
};
