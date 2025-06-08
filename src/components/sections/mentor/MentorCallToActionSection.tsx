
import { Button } from "@/components/ui/button";
import { GraduationCap, Users } from "lucide-react";
import { Link } from "react-router-dom";

export const MentorCallToActionSection = () => {
  return (
    <section className="py-16 relative overflow-hidden rounded-xl mx-4">
      <div className="absolute inset-0 bg-gradient-to-r from-picocareer-dark to-picocareer-primary opacity-90" />
      <div className="container mx-auto px-4 relative z-10">
        
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Join hundreds of professionals already mentoring the next generation and help students achieve their dreams.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto bg-white hover:bg-gray-100 text-picocareer-dark font-semibold text-lg py-6 px-8"
            >
              <Link to="/mentor-registration" className="flex items-center justify-center gap-3">
                <GraduationCap className="h-6 w-6" />
                Start Your Mentoring Journey
              </Link>
            </Button>
            
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 font-semibold text-lg py-6 px-8"
            >
              <Link to="/mentors" className="flex items-center justify-center gap-3">
                <Users className="h-6 w-6" />
                Meet Our Mentors
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-white/70 text-sm">
              Free to join • Flexible commitment • Meaningful impact
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
