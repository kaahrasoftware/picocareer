
// If the component is not yet defined or exported correctly, update the file like this:
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMentorStats } from "@/hooks/useMentorStats";
import { useAuthSession } from "@/hooks/useAuthSession";
import { AuthPromptDialog } from "@/components/auth/AuthPromptDialog";

export const MentorTabsSection = () => {
  const { data: stats, isLoading } = useMentorStats();
  const { session } = useAuthSession();
  const navigate = useNavigate();
  const isLoggedIn = !!session?.user;
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const handleStartMentoringClick = () => {
    if (isLoggedIn) {
      navigate('/mentor-registration');
    } else {
      setIsAuthDialogOpen(true);
    }
  };

  return (
    <section className="py-16 relative overflow-hidden rounded-xl mx-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-picocareer-dark via-primary to-picocareer-primary opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.08),transparent_50%)]" />
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse" />
      <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/5 rounded-full animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-20 w-8 h-8 bg-white/15 rounded-full animate-bounce delay-500" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
            <span className="text-yellow-300 font-medium text-sm uppercase tracking-wide">
              Join Our Community
            </span>
            <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse delay-300" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-6">
            Join {isLoading ? "hundreds" : `${stats?.mentorCount}+`} professionals already mentoring the next generation and help students achieve their dreams.
          </p>
          
          {/* Stats Bar */}
          {!isLoading && stats && (
            <div className="flex flex-wrap justify-center gap-6 mb-8 text-white/80">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                <span className="text-sm">{stats.satisfactionRate}% satisfaction rate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-200" />
                <span className="text-sm">{Math.floor(stats.totalSessions / 1000)}K+ sessions completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-400" />
                <span className="text-sm">{stats.averageRating}⭐ average rating</span>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              onClick={handleStartMentoringClick}
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto bg-white hover:bg-gray-100 text-picocareer-dark font-semibold text-lg py-6 px-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <GraduationCap className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
              Start Your Mentoring Journey
            </Button>
            
            {/* "Meet Our Mentors" Button - matches above button's design */}
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto bg-white hover:bg-gray-100 text-picocareer-dark font-semibold text-lg py-6 px-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <Link to="/mentor" className="flex items-center justify-center gap-3 focus:outline-none">
                <Users
                  className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300 text-picocareer-dark"
                />
                <span>Meet Our Mentors</span>
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-white/70 text-sm flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <div className="w-1 h-1 bg-green-300 rounded-full" />
                Free to join
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1 h-1 bg-blue-300 rounded-full" />
                Flexible commitment
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1 h-1 bg-purple-300 rounded-full" />
                Meaningful impact
              </span>
            </p>
          </div>
        </div>
      </div>

      <AuthPromptDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        title="Join Our Mentor Community"
        description="Create an account or sign in to register as a mentor and start helping students achieve their dreams."
        redirectUrl="/mentor-registration"
      />
    </section>
  );
};

