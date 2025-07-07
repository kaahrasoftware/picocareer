import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Users, Target, Trophy, ArrowRight, Sparkles, Zap } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { AuthPromptDialog } from "@/components/auth/AuthPromptDialog";
import { cn } from "@/lib/utils";

export const ModernHeroSection = () => {
  const {
    session
  } = useAuthSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  
  const handleBecomeMenteeClick = () => {
    if (isLoggedIn) {
      navigate('/mentor');
    } else {
      const referralCode = searchParams.get('ref') || localStorage.getItem('referralCode');
      if (referralCode) {
        navigate('/auth?tab=signup');
      } else {
        setIsAuthDialogOpen(true);
      }
    }
  };
  
  return <div className="relative isolate overflow-hidden">
      {/* Background Effects - Updated to use brand color */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#00A6D4]/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#00A6D4]/6 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-[#00A6D4]/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Hero Content */}
      <section className="text-center mb-16 pt-8">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#00A6D4]/10 text-[#00A6D4] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Built for Students by Students
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-black leading-tight">
            The Student-First
            <br />
            <span className="text-[#00A6D4]">Career Platform</span>
          </h1>
          
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">The all-in-one platform for mentorship, academic guidance, and professional development.</p>
          
          {/* Quick Stats - Updated to use brand color variations */}
          <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00A6D4] rounded-full animate-pulse" />
              <span className="text-muted-foreground">500+ Real Mentors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#33b3d9] rounded-full animate-pulse" />
              <span className="text-muted-foreground">1000+ Universities</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#0095c1] rounded-full animate-pulse" />
              <span className="text-muted-foreground">200+ Career Paths</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Search Section */}
      <section className="mb-12">
        <div className={cn("max-w-4xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-[#00A6D4]/10 transition-all duration-300", isSearchDialogOpen && "scale-105 shadow-2xl border-[#00A6D4]/20")}>
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-[#00A6D4]" />
            <h3 className="font-semibold text-gray-900">Find Your Perfect Match</h3>
          </div>
          <SearchBar placeholder="Search mentors, universities, career paths, scholarships, programs..." isSearchDialogOpen={isSearchDialogOpen} onSearchDialogChange={setIsSearchDialogOpen} />
        </div>
      </section>
      
      {/* Enhanced CTA Section - Updated to use brand color scheme */}
      <section className={cn("mb-16 transition-all duration-300 ease-in-out", isSearchDialogOpen ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100 pointer-events-auto translate-y-0")}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-white via-white to-[#00A6D4]/5 rounded-3xl border border-[#00A6D4]/10 shadow-lg overflow-hidden">
            <div className="p-8 md:p-12">
              {/* Header */}
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Connect with Real Mentors
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                  Get genuine guidance from professionals who've actually walked the path you want to take
                </p>
              </div>

              {/* Enhanced Benefits Grid - Updated to use consistent brand colors */}
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="group p-6 bg-gradient-to-br from-[#00A6D4]/5 to-[#00A6D4]/10 rounded-xl hover:shadow-md transition-all duration-300 border border-[#00A6D4]/10">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#00A6D4] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Real Mentorship</h4>
                      <p className="text-sm text-gray-600">Actual industry pros</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Connect with mentors who've been where you want to go</p>
                </div>
                
                <div className="group p-6 bg-gradient-to-br from-[#33b3d9]/5 to-[#33b3d9]/10 rounded-xl hover:shadow-md transition-all duration-300 border border-[#33b3d9]/10">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#33b3d9] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Actual Results</h4>
                      <p className="text-sm text-gray-600">Track record matters</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Join students who've landed dream internships and jobs</p>
                </div>
                
                <div className="group p-6 bg-gradient-to-br from-[#0095c1]/5 to-[#0095c1]/10 rounded-xl hover:shadow-md transition-all duration-300 border border-[#0095c1]/10">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#0095c1] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Student Community</h4>
                      <p className="text-sm text-gray-600">People who get it</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Connect with ambitious students building their futures</p>
                </div>
              </div>

              {/* Enhanced CTA */}
              <div className="text-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  {isLoggedIn ? <Button asChild size="lg" className="bg-gradient-to-r from-[#00A6D4] to-[#0095c1] hover:from-[#0095c1] hover:to-[#008bb5] text-white font-semibold px-8 py-6 h-auto text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                      <Link to="/mentor" className="flex items-center gap-2">
                        Find Your Mentor
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </Button> : <Button onClick={handleBecomeMenteeClick} size="lg" className="bg-gradient-to-r from-[#00A6D4] to-[#0095c1] hover:from-[#0095c1] hover:to-[#008bb5] text-white font-semibold px-8 py-6 h-auto text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                      <div className="flex items-center gap-2">
                        Start Building Your Future
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </Button>}
                  
                  <Button variant="outline" size="lg" onClick={handleBecomeMentorClick} className="border-2 border-[#00A6D4]/20 hover:border-[#00A6D4]/40 text-[#00A6D4] font-semibold px-8 py-6 h-auto text-lg hover:bg-[#00A6D4]/5 transition-all duration-300 rounded-xl">
                    Share Your Experience
                  </Button>
                </div>
                
                <p className="text-gray-500 text-sm mt-6">
                  {isLoggedIn ? "Connect with real mentors today" : "Join ambitious students • Real opportunities • Actual results"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthPromptDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} title="Join Our Community" description="Create an account or sign in to connect with mentors and access real opportunities." redirectUrl="/mentor" />
    </div>;
};
