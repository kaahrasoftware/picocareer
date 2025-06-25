
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, Sparkles } from "lucide-react";
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
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-indigo-300 to-blue-400 rounded-full blur-xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          {/* Header badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-5 py-2 rounded-full border border-blue-200 mb-8">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Join Our Mentor Community</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent mb-6 leading-tight">
            Ready to Make a Difference?
          </h2>
          
          <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Join {isLoading ? "hundreds" : `${stats?.mentorCount}+`} professionals already mentoring the next generation and help students achieve their dreams.
          </p>
          
          {/* Enhanced Stats Bar */}
          {!isLoading && stats && (
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-100 shadow-sm">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">{stats.satisfactionRate}% satisfaction rate</span>
              </div>
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-100 shadow-sm">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-sky-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">{Math.floor(stats.totalSessions / 1000)}K+ sessions completed</span>
              </div>
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-100 shadow-sm">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">{stats.averageRating}⭐ average rating</span>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            {/* Enhanced Primary Button - Start Mentoring */}
            <Button
              onClick={handleStartMentoringClick}
              size="lg"
              className="group relative w-full sm:w-auto bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white font-semibold px-10 py-6 h-auto text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border-0 overflow-hidden"
            >
              <div className="flex items-center gap-3 relative z-10">
                <GraduationCap className="h-6 w-6" />
                <span>Start Mentoring Today</span>
              </div>
              {/* Subtle animation overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </Button>
            
            {/* Enhanced Secondary Button - Meet Mentors */}
            <Button
              asChild
              variant="outline"
              size="lg"
              className="group w-full sm:w-auto bg-white/90 backdrop-blur-sm hover:bg-white border-2 border-blue-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-semibold px-10 py-6 h-auto text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Link to="/mentor" className="flex items-center justify-center gap-3">
                <Users className="h-6 w-6 transition-colors duration-300 group-hover:text-blue-600" />
                <span>Meet Our Mentors</span>
              </Link>
            </Button>
          </div>

          {/* Enhanced feature highlights */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100 p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center border border-green-200">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                </div>
                <span className="font-semibold text-slate-700">Free to join</span>
                <span className="text-sm text-slate-500">No upfront costs or hidden fees</span>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-sky-100 rounded-xl flex items-center justify-center border border-blue-200">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full"></div>
                </div>
                <span className="font-semibold text-slate-700">Flexible commitment</span>
                <span className="text-sm text-slate-500">Set your own schedule and availability</span>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center border border-purple-200">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
                </div>
                <span className="font-semibold text-slate-700">Meaningful impact</span>
                <span className="text-sm text-slate-500">Shape the future of students' careers</span>
              </div>
            </div>
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
