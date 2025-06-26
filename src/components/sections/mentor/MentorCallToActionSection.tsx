
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMentorStats } from "@/hooks/useMentorStats";
import { useAuthSession } from "@/hooks/useAuthSession";
import { AuthPromptDialog } from "@/components/auth/AuthPromptDialog";

export const MentorCallToActionSection = () => {
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
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-6">
            Join {isLoading ? "hundreds" : `${stats?.mentorCount}+`} professionals already mentoring the next generation and help students achieve their dreams.
          </p>
          
          {/* Stats Bar */}
          {!isLoading && stats && (
            <div className="flex flex-wrap justify-center gap-6 mb-8 text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">{stats.satisfactionRate}% satisfaction rate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">{Math.floor(stats.totalSessions / 1000)}K+ sessions completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-sm">{stats.averageRating}⭐ average rating</span>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            {/* Primary Button - Start Mentoring */}
            <Button
              onClick={handleStartMentoringClick}
              size="lg"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <GraduationCap className="h-5 w-5 mr-2" />
              Start Mentoring Today
            </Button>
            
            {/* Secondary Button - Meet Mentors */}
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-medium px-8 py-3 rounded-lg border border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              <Link to="/mentor" className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5" />
                Meet Our Mentors
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-slate-500 text-sm flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Free to join
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Flexible commitment
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
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
